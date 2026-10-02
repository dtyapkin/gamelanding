import "server-only";

import { CurrencyEnum, YooKassa } from "@webzaytsev/yookassa-ts-sdk";
import { getYooKassaEnv } from "@/lib/env";
import { kopecksToAmountValue } from "@/lib/money";

/**
 * Тонкая обёртка над YooKassa SDK.
 *
 * Здесь собраны все обращения к платёжному API в одном месте, чтобы:
 *  - не размазывать ключи по проекту;
 *  - везде использовать одну и ту же схему суммы и метаданных;
 *  - иметь одно понятное место, где происходит проверка платежа.
 */

type YooKassaClient = ReturnType<typeof YooKassa>;

let cachedClient: YooKassaClient | null = null;

/** Клиент создаётся лениво: на этапе `next build` ключей может ещё не быть. */
export function getYooKassa(): YooKassaClient {
  if (cachedClient) return cachedClient;
  const { shopId, secretKey } = getYooKassaEnv();
  cachedClient = YooKassa({ shop_id: shopId, secret_key: secretKey });
  return cachedClient;
}

export interface CreatePaymentArgs {
  /** id заказа в нашей базе — используется как ключ идемпотентности. */
  orderId: string;
  userId: string;
  productId: string;
  amountKopecks: number;
  /** Куда отправить покупателя после оплаты. */
  returnUrl: string;
  description: string;
}

export interface CreatedPayment {
  /** id платежа в YooKassa. */
  paymentId: string;
  /** Куда надо перенаправить покупателя для оплаты. */
  confirmationUrl: string;
}

/**
 * Создаёт платёж в YooKassa и возвращает ссылку на страницу оплаты.
 *
 * ИДЕМПОТЕНТНОСТЬ — второй аргумент `payments.create`. Если наш сервер
 * дважды отправит запрос с одним и тем же ключом (например, пользователь
 * дважды кликнул кнопку, или запрос повторился из-за обрыва связи),
 * YooKassa НЕ создаст второй платёж, а вернёт тот же самый.
 * Поэтому ключ идемпотентности = id нашего заказа.
 */
export async function createPayment(args: CreatePaymentArgs): Promise<CreatedPayment> {
  const { shopId } = getYooKassaEnv();

  const payment = await getYooKassa().payments.create(
    {
      amount: {
        // Строго две цифры после запятой: "300.00", а не "300".
        value: kopecksToAmountValue(args.amountKopecks),
        currency: CurrencyEnum.RUB,
      },
      // capture: true — деньги списываются сразу после подтверждения.
      // При capture:false платёж сначала висел бы в waiting_for_capture
      // и нам пришлось бы вручную его подтверждать.
      capture: true,
      confirmation: {
        type: "redirect",
        return_url: args.returnUrl,
      },
      description: args.description,
      // Метаданные — это «записка» для вебхука: по ней мы поймём,
      // какой заказ оплачен. Метаданные возвращаются в теле вебхука
      // и при перезапросе платежа из API.
      metadata: {
        order_id: args.orderId,
        user_id: args.userId,
        product_id: args.productId,
        shop_id: shopId,
      },
    },
    args.orderId, // idempotency key
  );

  // `confirmation` — это объединение типов (redirect / embedded / qr / ...).
  // TypeScript заставляет нас проверить type перед чтением confirmation_url.
  if (payment.confirmation?.type !== "redirect") {
    throw new Error(
      `YooKassa вернула неожиданный тип подтверждения: ${payment.confirmation?.type ?? "none"}`,
    );
  }

  const confirmationUrl = payment.confirmation.confirmation_url;
  if (!confirmationUrl) {
    throw new Error("YooKassa не вернула ссылку на оплату (confirmation_url пуст)");
  }

  return { paymentId: payment.id, confirmationUrl };
}

export interface VerifiedPayment {
  id: string;
  /** pending | waiting_for_capture | succeeded | canceled */
  status: string;
  /** Сумма платежа строкой, например "300.00". */
  amountValue: string;
  currency: string;
  /** true, если платёж прошёл в тестовом режиме. */
  test: boolean;
  /** Метаданные, которые мы сами положили при создании платежа. */
  metadata: Record<string, string>;
}

/**
 * ПЕРЕЗАПРОШИВАЕТ платёж из API YooKassa по его id.
 *
 * Это ГЛАВНЫЙ способ проверки оплаты. Телу вебхука доверять нельзя:
 * его теоретически может прислать кто угодно. А вот ответ API
 * YooKassa, запрошенный нашим сервером по secret_key, — достоверный.
 *
 * SDK не содержит метода «получить платёж по id», поэтому делаем прямой
 * запрос к официальному REST API.
 */
export async function fetchPayment(paymentId: string): Promise<VerifiedPayment | null> {
  const { shopId, secretKey } = getYooKassaEnv();

  const response = await fetch(
    `https://api.yookassa.ru/v3/payments/${encodeURIComponent(paymentId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      // Не hang'им соединение, если YooKassa не отвечает.
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    },
  );

  if (response.status === 404) return null;

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`YooKassa API вернула ${response.status}: ${body.slice(0, 300)}`);
  }

  const data = (await response.json()) as {
    id: string;
    status: string;
    amount?: { value?: string; currency?: string };
    test?: boolean;
    metadata?: Record<string, unknown>;
  };

  const metadata: Record<string, string> = {};
  for (const [key, value] of Object.entries(data.metadata ?? {})) {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      metadata[key] = String(value);
    }
  }

  return {
    id: data.id,
    status: data.status,
    amountValue: data.amount?.value ?? "",
    currency: data.amount?.currency ?? "RUB",
    test: data.test === true,
    metadata,
  };
}