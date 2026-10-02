import "server-only";

import { getBaseUrl } from "@/lib/env";
import { getProduct, type Product } from "@/lib/products";
import { attachYooKassaPaymentId, getOrCreatePendingOrder } from "@/lib/orders";
import { createPayment } from "@/lib/yookassa";

/**
 * ПОДГОТОВКА ОПЛАТЫ.
 *
 * Здесь важная деталь про `redirect()` из `next/navigation`.
 *
 * КАК РАБОТАЕТ redirect() — он НЕ просто меняет адрес, а БРОСАЕТ специальное
 * исключение (`NEXT_REDIRECT`), которое перехватывает сам Next.js.
 * Поэтому КАТЕГОРИЧЕСКИ нельзя писать так:
 *
 *   try {
 *     ...
 *     redirect(url)          // бросает NEXT_REDIRECT
 *   } catch (e) {
 *     throw new Error("Ошибка")   // <-- СЪЕДАЕТ редирект!
 *   }
 *
 * В старой версии проекта redirect() находился именно внутри try/catch.
 * Из-за этого после успешного создания платежа пользователь НЕ уходил
 * на страницу оплаты YooKassa, а вместо этого видел «Не удалось создать платёж».
 *
 * Решение: функция prepareCheckout() НИКОГДА не делает redirect и не бросает
 * исключения наружу — она возвращает результат. А вызывающий код
 * (app/actions/payment.ts) вызывает redirect() уже ПОСЛЕ неё.
 */

export type CheckoutErrorCode =
  | "unauthorized"
  | "unknown_product"
  | "payment_failed"
  | "already_paid";

export type PrepareCheckoutResult =
  | { ok: true; confirmationUrl: string; orderId: string }
  | { ok: false; code: CheckoutErrorCode; message: string };

export async function prepareCheckout(params: {
  userId: string;
  productId: unknown;
}): Promise<PrepareCheckoutResult> {
  const product = getProduct(params.productId);

  if (!product) {
    return {
      ok: false,
      code: "unknown_product",
      message: "Такого тарифа не существует",
    };
  }

  try {
    return await createPaymentForProduct(params.userId, product);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error(`[checkout] Не удалось создать платёж для ${product.id}:`, detail);
    return {
      ok: false,
      code: "payment_failed",
      message: "Не удалось связаться с платёжной системой. Попробуйте ещё раз через минуту.",
    };
  }
}

async function createPaymentForProduct(
  userId: string,
  product: Product,
): Promise<PrepareCheckoutResult> {
  const { order } = await getOrCreatePendingOrder({ userId, product });

  const payment = await createPayment({
    orderId: order.id,
    userId,
    productId: product.id,
    amountKopecks: order.amount_kopecks,
    returnUrl: buildReturnUrl(order.id),
    description: `${product.title} — ${product.description}`.slice(0, 128),
  });

  // Сохраняем id платежа у заказа: по нему вебхук и проверка по требованию
  // поймут, какой именно платёж относится к заказу.
  // Повторная запись идемпотентна, поэтому безопасно вызывать и при
  // переиспользовании уже существующего заказа.
  await attachYooKassaPaymentId(order.id, payment.paymentId);

  return { ok: true, confirmationUrl: payment.confirmationUrl, orderId: order.id };
}

/**
 * Адрес, на который YooKassa вернёт покупателя после оплаты.
 *
 * Обязательно кладём id заказа в query (?order=...), чтобы страница /download
 * сразу знала, какой заказ проверять, и не показывала «у вас ничего нет».
 */
export function buildReturnUrl(orderId: string): string {
  return `${getBaseUrl()}/download?order=${encodeURIComponent(orderId)}`;
}