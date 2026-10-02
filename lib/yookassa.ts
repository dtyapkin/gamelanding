import "server-only";

import { CurrencyEnum, YooKassa } from "@webzaytsev/yookassa-ts-sdk";
import { getYooKassaEnv, getYooKassaVatCode } from "@/lib/env";
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
  /** Email покупателя — уходит в чек (54-ФЗ). */
  customerEmail: string;
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
 * Тип блока `receipt` в запросе платежа — по нему SDK отвечает.
 * Объявлен отдельным алиасом, потому что ниже он используется в `as`.
 */
type ReceiptInRequest = NonNullable<
  Parameters<YooKassaClient["payments"]["create"]>[0]
>["receipt"];

/**
 * Собирает чек (54-ФЗ) для платежа.
 *
 * ПОЧЕМУ ЭТО ОБЯЗАТЕЛЬНО, А НЕ «ПОЖЕЛАНИЕ»:
 * если в кабинете ЮKassa включена отправка чеков, то запрос без `receipt`
 * отклоняется с ошибкой 400 «Receipt is missing or illegal» — то есть
 * сайт вообще не сможет принять оплату. Это проверено на боевом ключе:
 * без чека — 400, с чеком — платёж создаётся.
 *
 * ПОЧЕМУ ТУТ `as unknown as`:
 * в типах SDK есть `payment_subject`, `payment_mode`, `vat_code` и
 * `total_amount` не полностью — часть полей в типах отсутствует, хотя
 * API их принимает и требует. Поэтому собираем объект строго по
 * документации YooKassa и говорим компилятору, что доверяем API.
 *
 * Значения `payment_subject: "another"` и `payment_mode: "full_payment"`
 * подобраны перебором: именно эта пара проходит валидацию ЮKassa,
 * остальные значения она отклоняет как недопустимые.
 */
function buildReceipt(args: {
  customerEmail: string;
  itemDescription: string;
  amountKopecks: number;
}): ReceiptInRequest {
  const value = kopecksToAmountValue(args.amountKopecks);
  const vatCode = getYooKassaVatCode();

  return {
    customer: {
      // Чек YooKassa отправит на этот адрес — он же адрес покупателя.
      email: args.customerEmail,
    },
    items: [
      {
        description: args.itemDescription.slice(0, 128),
        quantity: "1.00",
        amount: { value, currency: CurrencyEnum.RUB },
        vat_code: vatCode,
        payment_subject: "another",
        payment_mode: "full_payment",
      },
    ],
    vat_code: vatCode,
    total_amount: { value, currency: CurrencyEnum.RUB },
  } as unknown as ReceiptInRequest;
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
  const amountValue = kopecksToAmountValue(args.amountKopecks);

  const payment = await getYooKassa().payments.create(
    {
      amount: {
        // Строго две цифры после запятой: "300.00", а не "300".
        value: amountValue,
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
      // Чек обязателен: без него YooKassa отклонит платёж (см. buildReceipt).
      receipt: buildReceipt({
        customerEmail: args.customerEmail,
        itemDescription: args.description,
        amountKopecks: args.amountKopecks,
      }),
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