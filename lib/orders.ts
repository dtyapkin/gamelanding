import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { amountValueToKopecks } from "@/lib/money";
import { fetchPayment } from "@/lib/yookassa";
import type { Product } from "@/lib/products";

/**
 * РАБОТА С ЗАКАЗАМИ.
 *
 * Кто где работает:
 *   - createClient()  — в браузере пользователя нет... точнее, в СЕССИИ пользователя.
 *                       Работает RLS: пользователь видит и создаёт только свои заказы.
 *   - getSupabaseAdmin() — server-to-server с service_role. RLS не действует!
 *                       Используется ТОЛЬКО для смены статуса заказа
 *                       (это делает вебхук YooKassa) и для выдачи ссылки на файл
 *                       ПОСЛЕ того, как права проверены вручную.
 *
 * ПОЧЕМУ ПОЛЬЗОВАТЕЛЬ НЕ МОЖЕТ САМ ПОСТАВИТЬ ЗАКАЗУ СТАТУС "succeeded":
 *   Политика RLS в supabase/migrations/0001_orders.sql НЕ разрешает
 *   пользователям UPDATE вообще. Иначе любой мог бы выполнить
 *   UPDATE orders SET status='succeeded' в консоли Supabase
 *   и скачать файл бесплатно.
 */

export const ORDER_STATUSES = [
  "pending",
  "succeeded",
  "canceled",
  "refunded",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface OrderRow {
  id: string;
  user_id: string;
  product_id: string;
  product_title: string;
  amount_kopecks: number;
  status: OrderStatus;
  yookassa_payment_id: string | null;
  created_at: string;
  paid_at: string | null;
}

export interface NewOrderInput {
  userId: string;
  product: Product;
}

/** Сколько необработанный заказ считается «свежим» и может быть переиспользован. */
const PENDING_ORDER_TTL_MINUTES = 30;

/** Код ошибки Postgres для нарушения уникальности (наш partial unique index). */
const UNIQUE_VIOLATION = "23505";

function newIdempotencyKey(userId: string, productId: string): string {
  // Читаемый ключ в логах YooKassa вместо случайного UUID.
  return `${userId.slice(0, 8)}:${productId}:${Date.now()}`;
}

/**
 * Возвращает неоплаченный заказ пользователя по этому тарифу, если он свежий,
 * иначе создаёт новый.
 *
 * Зачем переиспользовать: если пользователь случайно нажал кнопку покупки
 * дважды или обновил страницу во время редиректа на ЮKassa, не должно
 * появляться два заказа и два списания. Плюс ключ идемпотентности платежа
 * привязан к заказу (см. lib/yookassa.ts), поэтому повторный клик вернёт
 * из ЮKassa тот же самый платёж, а не создаст новый.
 */
export async function getOrCreatePendingOrder({
  userId,
  product,
}: NewOrderInput): Promise<{ order: OrderRow; created: boolean }> {
  const supabase = await createClient();

  const cutoff = new Date(Date.now() - PENDING_ORDER_TTL_MINUTES * 60_000).toISOString();

  const existing = await findPendingOrder(supabase, userId, product.id, cutoff);
  if (existing) return { order: existing, created: false };

  const { data, error } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      product_id: product.id,
      product_title: product.title,
      amount_kopecks: product.priceKopecks,
      // Статус задаётся здесь и никогда не приходит из браузера.
      status: "pending",
      idempotency_key: newIdempotencyKey(userId, product.id),
    })
    .select()
    .single();

  if (!error && data) {
    return { order: data as OrderRow, created: true };
  }

  // Гонка: параллельный запрос успел вставить заказ раньше нас
  // (сработал partial unique index). Тогда просто берём его.
  if (error?.code === UNIQUE_VIOLATION) {
    const raced = await findPendingOrder(supabase, userId, product.id, cutoff);
    if (raced) return { order: raced, created: false };
  }

  throw new Error(`Не удалось создать заказ: ${error?.message ?? "неизвестная ошибка"}`);
}

type SessionClient = Awaited<ReturnType<typeof createClient>>;

async function findPendingOrder(
  supabase: SessionClient,
  userId: string,
  productId: string,
  cutoffIso: string,
): Promise<OrderRow | null> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .eq("status", "pending")
    .gt("created_at", cutoffIso)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Не удалось найти Pending-заказ:", error.message);
    return null;
  }

  return (data as OrderRow | null) ?? null;
}

/**
 * Сохраняет id платежа YooKassa у заказа.
 * Через admin-клиент: пользователю UPDATE запрещён политиками RLS.
 */
export async function attachYooKassaPaymentId(
  orderId: string,
  paymentId: string,
): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("orders")
    .update({ yookassa_payment_id: paymentId })
    .eq("id", orderId);

  if (error) {
    throw new Error(`Не удалось сохранить id платежа: ${error.message}`);
  }
}

/**
 * Помечает заказ оплаченным.
 *
 * ИДЕМПОТЕНТНО: если статус уже succeeded, ничего не делаем и ошибки не будет.
 * ЮKassa присылает вебхуки повторно, если не увидела ответ 200, поэтому один
 * и тот же вебхук может прийти 3 раза — это нормально.
 *
 * Дополнительно сверяем id платежа, чтобы чужой/поддельный вебхук
 * не смог «оплатить» заказ, подставив ранее успешный платёж.
 */
export async function markOrderSucceeded(
  orderId: string,
  yookassaPaymentId: string,
): Promise<void> {
  const admin = getSupabaseAdmin();

  const { error } = await admin
    .from("orders")
    .update({ status: "succeeded", paid_at: new Date().toISOString() })
    .eq("id", orderId)
    .eq("yookassa_payment_id", yookassaPaymentId)
    .neq("status", "succeeded");

  if (error) {
    throw new Error(`Не удалось подтвердить заказ: ${error.message}`);
  }
}

/** Помечает заказ отменённым (покупатель не оплатил / отменил платёж). */
export async function markOrderCanceled(orderId: string, yookassaPaymentId?: string): Promise<void> {
  const admin = getSupabaseAdmin();

  let query = admin.from("orders").update({ status: "canceled" }).eq("id", orderId);

  if (yookassaPaymentId) {
    query = query.eq("yookassa_payment_id", yookassaPaymentId);
  }

  const { error } = await query.neq("status", "succeeded");

  if (error) {
    console.error(`Не удалось отменить заказ ${orderId}:`, error.message);
  }
}

/**
 * Заказ по id, но ТОЛЬКО если он принадлежит текущему пользователю.
 * Сессионный клиент + RLS отсекают чужие заказы; сверка user_id — вторая линия.
 */
export async function getOrderForUser(
  userId: string,
  orderId: string,
): Promise<OrderRow | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Не удалось получить заказ:", error.message);
    return null;
  }

  return (data as OrderRow | null) ?? null;
}

/** Все оплаченные заказы пользователя (самые свежие сверху). */
export async function getPaidOrders(userId: string): Promise<OrderRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "succeeded")
    .order("paid_at", { ascending: false, nullsFirst: false });

  if (error) {
    console.error("Не удалось получить список покупок:", error.message);
    return [];
  }

  return (data as OrderRow[]) ?? [];
}

/** Есть ли у пользователя успешный заказ по конкретному тарифу. */
export const hasPaidFor = cache(async (userId: string, productId: string): Promise<boolean> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .eq("status", "succeeded")
    .limit(1);

  return !error && (data?.length ?? 0) > 0;
});

/**
 * Заказы пользователя, по которым платёж ещё не подтверждён.
 *
 * Нужны для кнопки «Обновить статус» на странице покупок: если вебхук
 * потерялся, покупатель должен сам иметь возможность «додавить» проверку,
 * а не ждать неизвестно сколько и не видеть никакой кнопки.
 */
export async function getPendingOrdersForUser(userId: string): Promise<OrderRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "pending")
    .not("yookassa_payment_id", "is", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Не удалось получить незавершённые заказы:", error.message);
    return [];
  }

  return (data as OrderRow[]) ?? [];
}

export interface ReconcileResult {
  order: OrderRow;
  /** Изменился ли статус записи в базе. */
  changed: boolean;
  /** Готова ли покупка к выдаче файла. */
  granted: boolean;
  /** Человекочитаемая причина, если файл не выдаём. */
  reason?: string;
}

/**
 * «Синхронизация по требованию»: спрашивает у YooKassa реальный статус платежа.
 *
 * Зачем это нужно, если есть вебхук:
 *   1. Вебхук может задержаться на несколько секунд — а покупатель уже вернулся
 *      на сайт и видит «оплачено?» Наш экран не покажет ошибку, а подождёт.
 *   2. Вебхук мог потеряться (прокси, рестарт контейнера, фильтр IP).
 *      Проверка по требованию — «страховка», которая чинит такие случаи.
 *
 * Эндпоинт оплаты — единственное место, где мы решаем, можно ли отдать файл.
 */
export async function reconcileOrderWithYooKassa(order: OrderRow): Promise<ReconcileResult> {
  if (order.status === "succeeded") {
    return { order, changed: false, granted: true };
  }

  if (!order.yookassa_payment_id) {
    return { order, changed: false, granted: false, reason: "Платёж ещё не создан" };
  }

  let payment;
  try {
    payment = await fetchPayment(order.yookassa_payment_id);
  } catch (error) {
    // YooKassa недоступна — это не повод отказывать в доступе,
    // просто показываем «проверяем оплату» и пробуем ещё раз позже.
    console.error("Не удалось получить статус платежа из YooKassa:", error);
    return { order, changed: false, granted: false, reason: "Не удалось проверить платёж" };
  }

  if (!payment) {
    return { order, changed: false, granted: false, reason: "Платёж не найден в YooKassa" };
  }

  if (payment.status === "canceled") {
    await markOrderCanceled(order.id, order.yookassa_payment_id);
    return {
      order: { ...order, status: "canceled" },
      changed: true,
      granted: false,
      reason: "Платёж отменён",
    };
  }

  if (payment.status !== "succeeded") {
    return { order, changed: false, granted: false, reason: "Платёж ещё обрабатывается" };
  }

  // Платёж успешен — но сверяем СУММУ.
  // Если покупатель заплатил меньше, чем должен был, доступа не даём
  // и loudly пишем в лог: это признак ручной манипуляции или изменения цены.
  const paidKopecks = amountValueToKopecks(payment.amountValue);
  if (paidKopecks === null || paidKopecks < order.amount_kopecks) {
    console.error(
      `[SECURITY] Заказ ${order.id} оплачен на сумму ${payment.amountValue} ₽, ` +
        `а ожидалось ${(order.amount_kopecks / 100).toFixed(2)} ₽. Доступ НЕ выдан.`,
    );
    return { order, changed: false, granted: false, reason: "Сумма платежа не совпадает с заказом" };
  }

  await markOrderSucceeded(order.id, order.yookassa_payment_id);
  return {
    order: { ...order, status: "succeeded", paid_at: new Date().toISOString() },
    changed: true,
    granted: true,
  };
}