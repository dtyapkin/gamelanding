import { NextResponse } from "next/server";
import { isYooKassaIP } from "@webzaytsev/yookassa-ts-sdk";
import { isWebhookIpCheckEnabled } from "@/lib/env";
import { amountValueToKopecks } from "@/lib/money";
import { markOrderCanceled, markOrderSucceeded } from "@/lib/orders";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { fetchPayment } from "@/lib/yookassa";

/**
 * ВЕБХУК YOOKASSA — сердце системы оплаты.
 *
 * ВАЖНО ПРО ИМЯ ФАЙЛА
 * --------------------
 * Next.js считает обработчиком запросов файл, который называется РОВНО
 * `route.ts`. В старой версии проекта он назывался `rote.ts` (опечатка),
 * поэтому адрес /api/webhooks/yookassa вообще не существовал:
 * YooKassa получала 404 и никогда не сообщала об оплате.
 *
 * КАК ПРОВЕРЯЕТСЯ ОПЛАТА (порядок важен)
 * ---------------------------------------
 * 1. Отсекаем запросы не с IP YooKassa (дополнительный слой).
 * 2. Берём из тела только id платежа.
 * 3. ПЕРЕЗАПРАШИВАЕМ платёж из API YooKassa по этому id.
 *    Телу вебхука мы не доверяем: это просто подсказка, кто прислал запрос.
 *    Ответ API получен по нашему secret_key — его достоверность гарантирована.
 * 4. Только из ПРОВЕРЕННОГО платежа берём метаданные (в т.ч. id заказа).
 * 5. Сверяем: сумма совпадает с заказом, id платежа совпадает с записанным.
 * 6. Меняем статус заказа.
 *
 * ЮKassa считает вебхук необработанным, если не получила 2xx за ~30 секунд
 * и будет повторять его несколько раз. Наш обработчик идемпотентный,
 * поэтому повторы ему не мешают.
 */

export const runtime = "nodejs";

/** Поля, которые нас интересуют в теле вебхука. */
interface WebhookBody {
  event?: string;
  object?: {
    id?: string;
    status?: string;
  };
}

function getClientIp(request: Request): string | null {
  // На VPS перед приложением почти всегда стоит nginx/Cloudflare,
  // поэтому реальный IP клиента лежит в этих заголовках.
  const candidates = [
    request.headers.get("cf-connecting-ip"),
    request.headers.get("true-client-ip"),
    request.headers.get("x-real-ip"),
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
  ];

  return candidates.find((value): value is string => Boolean(value)) ?? null;
}

export async function POST(request: Request) {
  // --- 1. Проверка IP -------------------------------------------------
  if (isWebhookIpCheckEnabled()) {
    const clientIp = getClientIp(request);

    if (!clientIp || !isYooKassaIP(clientIp)) {
      console.warn(`[yookassa-webhook] Запрос с неразрешённого IP: ${clientIp ?? "неизвестен"}`);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // --- 2. Разбор тела -------------------------------------------------
  let body: WebhookBody;

  try {
    body = (await request.json()) as WebhookBody;
  } catch {
    console.warn("[yookassa-webhook] Тело запроса не является JSON");
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const event = body.event;
  const paymentId = body.object?.id;

  console.log(`[yookassa-webhook] Событие: ${event ?? "неизвестное"}, платёж: ${paymentId ?? "нет"}`);

  if (!paymentId) {
    // Событие без объекта платежа (например payout.*) нас не касается.
    // Отвечаем 200, иначе YooKassa будет бесконечно ретраить.
    return NextResponse.json({ ok: true, ignored: true });
  }

  if (event !== "payment.succeeded" && event !== "payment.canceled") {
    // payment.pending / payment.waiting_for_capture / прочее — не наше дело.
    return NextResponse.json({ ok: true, ignored: true });
  }

  // --- 3. Перезапрос платежа из API YooKassa ---------------------------
  let payment;
  try {
    payment = await fetchPayment(paymentId);
  } catch (error) {
    // 5xx: YooKassa повторит доставку. Так и должно быть — лучше подождёт,
    // чем мы потеряем оплату.
    console.error("[yookassa-webhook] YooKassa API недоступна:", error);
    return NextResponse.json({ error: "Upstream unavailable" }, { status: 503 });
  }

  if (!payment) {
    console.warn(`[yookassa-webhook] Платёж ${paymentId} не найден в YooKassa`);
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  // --- 4. Id заказа берём только из проверенного объекта ----------------
  const orderId = payment.metadata.order_id;

  if (!orderId) {
    console.error(`[yookassa-webhook] В метаданных платежа ${paymentId} нет order_id`);
    return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
  }

  const { data: order, error: orderError } = await getSupabaseAdmin()
    .from("orders")
    .select("id, amount_kopecks, status, yookassa_payment_id")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError) {
    console.error("[yookassa-webhook] Ошибка чтения заказа:", orderError.message);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  if (!order) {
    console.error(`[yookassa-webhook] Заказ ${orderId} не найден в базе`);
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // --- 5. Кросс-проверки ------------------------------------------------
  // Если в базе уже записан ДРУГОЙ платёж — не трогаем заказ.
  if (order.yookassa_payment_id && order.yookassa_payment_id !== payment.id) {
    console.error(
      `[SECURITY] Заказ ${orderId}: вебхук с платёжом ${payment.id}, ` +
        `а в базе ${order.yookassa_payment_id}. Заказ оставлен без изменений.`,
    );
    return NextResponse.json({ error: "Payment mismatch" }, { status: 409 });
  }

  const paidKopecks = amountValueToKopecks(payment.amountValue);

  // --- 6. Меняем статус -------------------------------------------------
  if (payment.status === "canceled" || event === "payment.canceled") {
    await markOrderCanceled(orderId, payment.id);
    console.log(`[yookassa-webhook] Заказ ${orderId} отменён`);
    return NextResponse.json({ ok: true, status: "canceled" });
  }

  if (payment.status !== "succeeded") {
    // Событие сказало «succeeded», а API — нет. Не выдаём доступ,
    // просто отвечаем 200: повторять это событие бессмысленно.
    console.warn(`[yookassa-webhook] Статус платежа ${payment.id} = ${payment.status}`);
    return NextResponse.json({ ok: true, status: payment.status });
  }

  if (paidKopecks === null || paidKopecks < order.amount_kopecks) {
    console.error(
      `[SECURITY] Заказ ${orderId}: оплачено ${payment.amountValue} ₽, ` +
        `ожидалось ${(order.amount_kopecks / 100).toFixed(2)} ₽. Доступ НЕ выдан.`,
    );
    return NextResponse.json({ error: "Amount mismatch" }, { status: 409 });
  }

  await markOrderSucceeded(orderId, payment.id);
  console.log(`[yookassa-webhook] Заказ ${orderId} оплачен (платёж ${payment.id})`);

  return NextResponse.json({ ok: true, status: "succeeded" });
}