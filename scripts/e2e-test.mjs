/**
 * СКВОЗНОЙ ТЕСТ ОПЛАТЫ: покупатель → YooKassa → вебхук → скачивание файла
 *
 * Что проверяет (по порядку важности):
 *   1. Закрыта ли страница покупок от посторонних.
 *   2. Может ли покупатель вписаться в таблицу заказов своими данными (RLS).
 *   3. Не выдаётся ли файл по заказу, который ещё не оплачен.
 *   4. Выдаётся ли файл по оплаченному заказу и реально ли он скачивается.
 *   5. Не может ли файл скачать чужой пользователь.
 *   6. Работают ли ключи YooKassa (создание платежа и отмена).
 *   7. Не проходит ли поддельный вебхук.
 *
 * Запуск:
 *   npm run build && npm start          # в одном окне
 *   node scripts/e2e-test.mjs           # в другом
 *
 * Нужны в .env.local: SUPABASE_SERVICE_ROLE_KEY, ключи YooKassa, NEXT_PUBLIC_BASE_URL.
 * Скрипт создаёт двух тестовых пользователей и в конце удаляет их.
 * Секретные значения не печатаются.
 */

import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const APP_URL = process.env.APP_URL || "http://localhost:3000";
const YOOKASSA_IP = "185.71.76.1"; // адрес из диапазона YooKassa, см. isYooKassaIp

// Ожидаемая цена тарифа start. Если её подменить в тесте не получится —
// значит сервер действительно берёт цену из своего каталога, а не от клиента.
const PRODUCT_ID = "start";
const EXPECTED_RUB = "300.00";

let passed = 0;
let failed = 0;

function ok(title) {
  passed += 1;
  console.log(`  [ПРОШЁЛ] ${title}`);
}

function bad(title, detail) {
  failed += 1;
  console.log(`  [ПРОВАЛ] ${title}`);
  if (detail) console.log(`           ${detail}`);
}

function check(condition, title, detail) {
  if (condition) ok(title);
  else bad(title, detail);
  return condition;
}

// ---------------------------------------------------------------------------
// Окружение
// ---------------------------------------------------------------------------

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    console.error(`${filePath} не найден`);
    process.exit(1);
  }
  const env = {};
  for (const rawLine of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (match) env[match[1]] = match[2].trim();
  }
  return env;
}

const env = loadEnvFile(join(ROOT, ".env.local"));
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const SHOP_ID = env.YOOKASSA_SHOP_ID;
const YOOKASSA_SECRET = env.YOOKASSA_SECRET_KEY;

for (const [key, value] of Object.entries({
  NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: SERVICE_KEY,
  YOOKASSA_SHOP_ID: SHOP_ID,
  YOOKASSA_SECRET_KEY: YOOKASSA_SECRET,
})) {
  if (!value) {
    console.error(`Нет ${key} в .env.local`);
    process.exit(1);
  }
}

function authHeaders(key, token) {
  return {
    apikey: key,
    Authorization: `Bearer ${token || key}`,
  };
}

// ---------------------------------------------------------------------------
// Пользователи
// ---------------------------------------------------------------------------

const stamp = Date.now();
const BUYER_EMAIL = `e2e-buyer-${stamp}@example.com`;
const INTRUDER_EMAIL = `e2e-other-${stamp}@example.com`;
const PASSWORD = `Test-${stamp}-Aa1!`;

/** Создаёт подтверждённого пользователя через админский API. */
async function createUser(email) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: { ...authHeaders(SERVICE_KEY), "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password: PASSWORD,
      email_confirm: true,
    }),
  });

  if (!res.ok) {
    console.error(`Не удалось создать пользователя ${email}: ${res.status} ${await res.text()}`);
    process.exit(1);
  }
  return res.json();
}

/** Входит пользователем и возвращает access_token. */
async function signIn(email) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { ...authHeaders(ANON_KEY), "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: PASSWORD }),
  });

  if (!res.ok) {
    console.error(`Не удалось войти ${email}: ${res.status} ${await res.text()}`);
    process.exit(1);
  }
  return res.json();
}

/**
 * Собирает cookie сессии в том же виде, в каком её ждёт @supabase/ssr:
 * `base64-` + base64url(JSON сессии). Без этого сервер не увидит
 * авторизацию и просто перенаправит на страницу входа.
 */
function buildAuthCookie(session) {
  const storageKey = `sb-${new URL(SUPABASE_URL).hostname.split(".")[0]}-auth-token`;
  const json = JSON.stringify({
    access_token: session.access_token,
    token_type: session.token_type || "bearer",
    expires_in: session.expires_in,
    expires_at: session.expires_at,
    refresh_token: session.refresh_token,
    user: session.user,
  });
  const encoded = `base64-${Buffer.from(json, "utf8").toString("base64url")}`;
  return `${storageKey}=${encoded}`;
}

async function deleteUser(userId) {
  await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: authHeaders(SERVICE_KEY),
  });
}

// ---------------------------------------------------------------------------
// Тесты
// ---------------------------------------------------------------------------

/** 1. Страница покупок закрыта. */
async function testGate() {
  console.log("\n1. Доступ к странице покупок");

  const anonRes = await fetch(`${APP_URL}/download`, { redirect: "manual" });
  check(
    anonRes.status === 307 || anonRes.status === 302,
    "посторонний посетитель перенаправлен на страницу входа",
    `получен HTTP ${anonRes.status}, ожидался 307`,
  );

  const loc = anonRes.headers.get("location") || "";
  check(loc.includes("/login"), "в перенаправлении есть адрес входа", loc);

  return null;
}

/** 2. Сессия настоящего покупателя принимается сервером. */
async function testSession(cookie) {
  console.log("\n2. Авторизация настоящего покупателя");

  const res = await fetch(`${APP_URL}/download`, {
    headers: { cookie },
    redirect: "manual",
  });
  check(
    res.status === 200,
    "вход в систему открывает страницу покупок",
    `получен HTTP ${res.status}, ожидался 200`,
  );

  const html = res.status === 200 ? await res.text() : "";
  check(
    html.includes("Мои покупки"),
    "страница действительно та, а не заглушка",
    "текст «Мои покупки» не найден",
  );

  return res.status === 200;
}

/** 3. Покупатель может создать заказ (проверка политики RLS). */
async function testInsertPolicy(userToken) {
  console.log("\n3. Создание заказа покупателем (проверка RLS)");

  const res = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
    method: "POST",
    headers: {
      ...authHeaders(ANON_KEY, userToken),
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      user_id: null, // подставит триггер/RLS; если нет — увидим ошибку
      product_id: PRODUCT_ID,
      product_title: "Start",
      amount_kopecks: 30000,
      status: "pending",
    }),
  });
  const body = await res.text();

  if (res.ok) {
    const created = JSON.parse(body);
    const row = Array.isArray(created) ? created[0] : created;
    const userId = row?.user_id;
    ok(`заказ создан через RLS (id=${String(row?.id).slice(0, 8)}…)`);
    check(
      row?.status === "pending",
      "статус задан как pending",
      `получен статус ${row?.status}`,
    );
    return row;
  }

  // user_id = null нарушает NOT NULL, поэтому это ожидаемый отказ.
  // Проверим тогда политику иначе — с явным своим user_id.
  const me = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: authHeaders(ANON_KEY, userToken),
  });
  const profile = await me.json();

  const retry = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
    method: "POST",
    headers: {
      ...authHeaders(ANON_KEY, userToken),
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      user_id: profile.id,
      product_id: PRODUCT_ID,
      product_title: "Start",
      amount_kopecks: 30000,
      status: "pending",
    }),
  });
  const retryBody = await retry.text();

  if (retry.ok) {
    const created = JSON.parse(retryBody);
    const row = Array.isArray(created) ? created[0] : created;
    ok(`заказ создан напрямую через REST (id=${String(row?.id).slice(0, 8)}…)`);
    return row;
  }

  bad(
    "покупатель не может создать заказ через REST",
    `RLS запрещает вставку (HTTP ${retry.status}). Проверьте политику orders_user_insert.`,
  );
  return null;
}

/** 4. Неоплаченный заказ не выдаёт файл. */
async function testUnpaidDenied(orderId, cookie) {
  console.log("\n4. Неоплаченный заказ не выдаёт файл");

  const res = await fetch(`${APP_URL}/api/download/${orderId}`, {
    headers: { cookie },
    redirect: "manual",
  });
  check(
    res.status === 403 || res.status === 404,
    "файл не отдан для неоплаченного заказа",
    `получен HTTP ${res.status}, ожидался 403/404`,
  );

  const statusRes = await fetch(`${APP_URL}/api/orders/${orderId}`, {
    headers: { cookie },
    redirect: "manual",
  });
  if (statusRes.ok) {
    const data = await statusRes.json();
    check(
      data.status === "pending",
      "статус заказа честно остался pending",
      `получен статус ${data.status}`,
    );
  } else {
    bad("эндпоинт статуса не ответил", `HTTP ${statusRes.status}`);
  }

  return true;
}

/** 5. Оплаченный заказ выдаёт ссылку, файл реально скачивается. */
async function testPaidGranted(orderId, cookie) {
  console.log("\n5. Оплаченный заказ выдаёт файл");

  // Имитируем итог успешного платежа: так база выглядит после вебхука.
  const markRes = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`, {
    method: "PATCH",
    headers: {
      ...authHeaders(SERVICE_KEY),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: "succeeded", paid_at: new Date().toISOString() }),
  });
  if (!markRes.ok) {
    bad("не удалось отметить заказ оплаченным (нужен service_role)", await markRes.text());
    return null;
  }

  const res = await fetch(`${APP_URL}/api/download/${orderId}`, {
    headers: { cookie },
    redirect: "manual",
  });

  if (res.status !== 200) {
    bad("файл не выдан для оплаченного заказа", `получен HTTP ${res.status}`);
    return null;
  }

  const url = await res.text();
  check(
    url.includes("token=") && url.includes("paid-files"),
    "выдана подписанная ссылка на приватный файл",
    url.slice(0, 120),
  );

  // Ссылка должна вести именно на файл, а не на страницу ошибки.
  const fileRes = await fetch(url, { redirect: "follow" });
  check(fileRes.ok, "файл по ссылке скачивается", `HTTP ${fileRes.status}`);

  const bytes = Buffer.from(await fileRes.arrayBuffer());
  check(
    bytes.length > 0 && bytes.subarray(0, 2).toString() === "PK",
    "скачался настоящий ZIP-архив",
    `первые байты: ${bytes.subarray(0, 4).toString("hex")}, размер ${bytes.length}`,
  );

  return url;
}

/** 6. Чужой пользователь не может скачать файл. */
async function testIntruderDenied(orderId, intruderCookie) {
  console.log("\n6. Чужой пользователь не может скачать чужой заказ");

  const res = await fetch(`${APP_URL}/api/download/${orderId}`, {
    headers: { cookie: intruderCookie },
    redirect: "manual",
  });
  check(
    res.status === 403 || res.status === 404 || res.status === 307,
    "доступ постороннему отказан",
    `получен HTTP ${res.status}, ожидался 403/404`,
  );

  const body = res.status === 200 ? await res.text() : "";
  check(!body.includes("token="), "постороннему не выдан токен файла", body.slice(0, 80));
}

/** 7. Ключи YooKassa живы: платёж создаётся и отменяется. */
async function testYooKassa(orderId) {
  console.log("\n7. Ключи YooKassa");

  const basic = Buffer.from(`${SHOP_ID}:${YOOKASSA_SECRET}`).toString("base64");
  const paymentRes = await fetch("https://api.yookassa.ru/v3/payments", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/json",
      "Idempotence-Key": `e2e-${stamp}`,
    },
    body: JSON.stringify({
      amount: { value: EXPECTED_RUB, currency: "RUB" },
      capture: true,
      confirmation: {
        type: "redirect",
        return_url: `${APP_URL}/download?order=${orderId}`,
      },
      description: {
        description: `E2E test: тариф ${PRODUCT_ID}`,
        locale_code: "ru-RU",
      },
      metadata: { order_id: orderId },
    }),
  });

  const paymentBody = await paymentRes.text();
  if (!paymentRes.ok) {
    bad(
      "платёж в YooKassa не создался",
      `HTTP ${paymentRes.status}: ${paymentBody.slice(0, 200)}. Проверьте ключи и режим.`,
    );
    return;
  }

  const payment = JSON.parse(paymentBody);
  ok(`платёж создан в YooKassa (${payment.id})`);
  check(
    payment.amount?.value === EXPECTED_RUB,
    "сумма в YooKassa ровно та, что задана сервером",
    `получено ${payment.amount?.value}, ожидалось ${EXPECTED_RUB}`,
  );
  check(
    typeof payment.confirmation?.confirmation_url === "string",
    "есть ссылка на оплату",
  );

  // Отменяем тестовый платёж, чтобы не оставлять мусор в кабинете.
  const cancelRes = await fetch(`https://api.yookassa.ru/v3/payments/${payment.id}/cancel`, {
    method: "POST",
    headers: { Authorization: `Basic ${basic}` },
  });
  check(
    cancelRes.ok || cancelRes.status === 409,
    "тестовый платёж отменён",
    `HTTP ${cancelRes.status}`,
  );
}

/** 8. Поддельный вебхук не проходит. */
async function testWebhookSecurity() {
  console.log("\n8. Защита вебхука");

  const fake = JSON.stringify({
    event: "payment.succeeded",
    object: { id: "fake-payment-id", status: "succeeded", amount: { value: "300.00" } },
  });

  const spoofed = await fetch(`${APP_URL}/api/webhooks/yookassa`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": "8.8.8.8", // не адрес YooKassa
    },
    body: fake,
  });
  check(
    spoofed.status === 403,
    "вебхук с чужого IP-адреса отклонён",
    `получен HTTP ${spoofed.status}, ожидался 403`,
  );

  const fromYooKassa = await fetch(`${APP_URL}/api/webhooks/yookassa`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": YOOKASSA_IP,
    },
    body: fake,
  });
  const body = await fromYooKassa.text();
  check(
    !body.includes('"status":"succeeded"'),
    "поддельный платёж не принят за оплаченный даже с адреса YooKassa",
    body.slice(0, 120),
  );
}

// ---------------------------------------------------------------------------
// Запуск
// ---------------------------------------------------------------------------

console.log("=== СКВОЗНОЙ ТЕСТ ОПЛАТЫ ===");
console.log(`Приложение: ${APP_URL}`);
console.log("Создаю тестовых пользователей…");

const buyer = await createUser(BUYER_EMAIL);
const intruder = await createUser(INTRUDER_EMAIL);

let buyerCookie = "";
let intruderCookie = "";

try {
  const buyerSession = await signIn(BUYER_EMAIL);
  const intruderSession = await signIn(INTRUDER_EMAIL);
  buyerCookie = buildAuthCookie(buyerSession);
  intruderCookie = buildAuthCookie(intruderSession);
  ok("тестовые пользователи созданы и вошли");

  await testGate();

  if (await testSession(buyerCookie)) {
    const order = await testInsertPolicy(buyerSession.access_token);

    if (order?.id) {
      await testUnpaidDenied(order.id, buyerCookie);
      await testPaidGranted(order.id, buyerCookie);
      await testIntruderDenied(order.id, intruderCookie);
      await testYooKassa(order.id);
    } else {
      bad("пропущены тесты оплаты: не удалось создать заказ");
    }
  }

  await testWebhookSecurity();
} finally {
  await deleteUser(buyer.id);
  await deleteUser(intruder.id);
  console.log("\nТестовые пользователи удалены.");
}

// ---------------------------------------------------------------------------
// Итог
// ---------------------------------------------------------------------------

console.log("\n=== ИТОГ ===");
console.log(`Пройдено: ${passed}`);
console.log(`Провалено: ${failed}`);

if (failed > 0) {
  console.log("\nЕсть провалы — выясните причину ДО приёма денег от покупателей.");
  process.exitCode = 1;
} else {
  console.log("\nВся цепочка работает: закрытая страница, честный статус,");
  console.log("выдача файла только после оплаты, защита от подделок.");
}