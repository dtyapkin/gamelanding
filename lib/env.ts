import "server-only";

/**
 * Единая точка чтения переменных окружения.
 *
 * Почему так сложно:
 * 1. Переменные читаются лениво (внутри функций), а не при импорте модуля.
 *    Иначе `next build` падал бы с ошибкой, если переменная не задана
 *    на этапе сборки (в Docker её обычно задают только во время запуска).
 * 2. Любая обязательная переменная проверяется сразу и с понятным сообщением.
 *    Пустая строка тоже считается отсутствующей — это частая ошибка в .env.
 */

export class MissingEnvError extends Error {
  constructor(name: string) {
    super(
      `Отсутствует обязательная переменная окружения ${name}. ` +
        `Скопируйте .env.example в .env.local (или задайте её в docker-compose.yml) и заполните значение.`,
    );
    this.name = "MissingEnvError";
  }
}

function raw(name: string): string | undefined {
  const value = process.env[name];
  if (value === undefined || value.trim() === "") return undefined;
  return value.trim();
}

function required(name: string): string {
  const value = raw(name);
  if (value === undefined) throw new MissingEnvError(name);
  return value;
}

function optional(name: string): string | undefined {
  return raw(name);
}

/** URL и anon-ключ Supabase. Нужны и на сервере, и (potentially) в браузере. */
export function getSupabasePublicEnv() {
  return {
    url: required("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: required("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  };
}

/**
 * service_role-ключ Supabase. Он обходит RLS, поэтому используется ТОЛЬКО
 * на сервере: вебхук YooKassa (у него нет сессии пользователя) и выдача
 * подписанной ссылки на файл после того, как доступ уже проверен.
 */
export function getSupabaseAdminKey(): string {
  return required("SUPABASE_SERVICE_ROLE_KEY");
}

/** Ключи интеграции с YooKassa (кабинет -> Настройки -> API ключи). */
export function getYooKassaEnv() {
  return {
    shopId: required("YOOKASSA_SHOP_ID"),
    secretKey: required("YOOKASSA_SECRET_KEY"),
  };
}

/**
 * Адрес сайта. Используется в return_url (куда ЮKassa возвращает покупателя).
 * ВАЖНО: в проде это должен быть боевой https-домен, иначе покупатель вернётся
 * на localhost и не попадёт на страницу скачивания.
 */
export function getBaseUrl(): string {
  const value = required("NEXT_PUBLIC_BASE_URL").replace(/\/+$/, "");
  return value;
}

/**
 * Имя бакета Supabase Storage с платными файлами. Бакет приватный (public = false),
 * прямые ссылки на файлы из него не работают.
 */
export function getStorageBucket(): string {
  return optional("SUPABASE_STORAGE_BUCKET") ?? "paid-files";
}

/**
 * Включать ли проверку IP-адреса в вебхуке.
 * По умолчанию включена (значение "1"). В локальной разработке её удобно
 * выключить значением "0": локально вебхук приходит не с IP ЮKassa.
 *
 * ВАЖНО: проверка IP — это дополнительный слой, а не основная защита.
 * За nginx/Cloudflare заголовок x-forwarded-for можно подделать,
 * поэтому главная проверка — перезапрос платежа из API ЮKassa.
 */
export function isWebhookIpCheckEnabled(): boolean {
  return (optional("YOOKASSA_WEBHOOK_IP_CHECK") ?? "1") !== "0";
}

/**
 * Сколько секунд живёт подписанная ссылка на файл.
 * Маленькое значение = меньше риск утечки. 60 секунд хватает, чтобы браузер
 * начал скачивание (файл может весить сотни мегабайт).
 */
export function getSignedUrlTtlSeconds(): number {
  const value = Number(optional("SUPABASE_SIGNED_URL_TTL") ?? 60);
  if (!Number.isFinite(value) || value <= 0 || value > 3600) return 60;
  return Math.floor(value);
}

/**
 * Ставка НДС для чека (54-ФЗ). Значения YooKassa:
 *   1 — НДС 20%
 *   2 — НДС 10%
 *   3 — без НДС
 *   4 — НДС 20/120
 *   5 — НДС 10/110
 *   6 — НДС 0
 *
 * По умолчанию 3 («без НДС») — так чаще всего работают ИП и самозанятые.
 * Если у вас ОСНО с НДС, поставьте в .env.local  YOOKASSA_VAT_CODE=1.
 *
 * ВАЖНО: если в кабинете ЮKassa включена отправка чеков, платёж не создастся
 * вообще без корректного vat_code — ЮKassa вернёт ошибку 400.
 */
export function getYooKassaVatCode(): number {
  const value = Number(optional("YOOKASSA_VAT_CODE") ?? 3);
  if (![1, 2, 3, 4, 5, 6].includes(value)) return 3;
  return value;
}

/**
 * Диагностика для /api/health: показывает, какие переменные заданы,
 * не раскрывая их значения. Помогает понять, почему Docker-контейнер падает.
 */
export function collectEnvReport() {
  const names = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "YOOKASSA_SHOP_ID",
    "YOOKASSA_SECRET_KEY",
    "NEXT_PUBLIC_BASE_URL",
  ];
  const required_ = new Set(names);
  return names.map((name) => ({
    name,
    present: raw(name) !== undefined,
    required: required_.has(name),
  }));
}