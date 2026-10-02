"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { hasPaidFor } from "@/lib/orders";
import { prepareCheckout } from "@/lib/checkout";
import { getProduct } from "@/lib/products";

/**
 * «Купить» — Server Action, вызывается из формы в components/Pricing.tsx.
 *
 * Почему Server Action, а не обычная форма в API?
 *   - код исполняется на сервере, поэтому ключи YooKassa недоступны браузеру;
 *   - результат сразу рендерится в HTML (спид-индексы лучше, чем у клиентских
 *     запросов), а JS не нужен для работы кнопки;
 *   - Next.js сам добавляет CSRF-защиту: сервер проверяет Origin/Host,
 *     поэтому чужий сайт не сможет отправить форму от имени пользователя.
 *
 * ВАЖНО ПРО `redirect()`: он бросает специальное исключение, поэтому
 * мы НЕ оборачиваем его в try/catch. Всё, что может упасть, уже обработано
 * внутри prepareCheckout() и возвращается как { ok: false, message }.
 */
export async function startCheckout(formData: FormData): Promise<void> {
  // formData приходит из браузера, поэтому значение недоверенное.
  const productId = formData.get("productId");

  // requireUser сам уведёт на /login с параметром next=...,
  // если пользователь ещё не вошёл. Код дальше выполнится
  // только для авторизованного пользователя.
  const user = await requireUser("/download");

  const product = getProduct(productId);
  if (!product) {
    redirect("/download?error=unknown_product");
  }

  // Не даём оплатить повторно то, что уже куплено.
  if (await hasPaidFor(user.id, product.id)) {
    redirect(`/download?order_created=already_paid&product=${product.id}`);
  }

  const result = await prepareCheckout({ userId: user.id, productId: product.id });

  if (!result.ok) {
    // Сообщение уходит в query-строку и показывается на /download.
    // Коды ошибок вместо текста — чтобы текст можно было менять,
    // не ломая уже отправленные ссылки.
    redirect(`/download?error=${result.code}`);
  }

  // Уходим на страницу оплаты YooKassa.
  // Это ПОСЛЕ try/catch — редирект не должен перехватываться.
  redirect(result.confirmationUrl);
}