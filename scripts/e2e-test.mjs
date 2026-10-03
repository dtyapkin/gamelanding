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
// В базе сумма хранится в копейках целым числом, а в YooKassa — строкой
// в рублях. Это разные форматы, и путать их нельзя: "300.00" в колонке
// integer даёт ошибку 22P02.
const EXPECTED_KOPEKS = Math.round(Number(EXPECTED_RUB) * 100);

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

/**
 * 0. Регистрация через публичную форму — ровно тот путь, которым идёт
 *    посетитель сайта.
 *
 * ПОЧЕМУ ОТДЕЛЬНЫЙ ТЕСТ, А НЕ ЧАСТЬ СОЗДАНИЯ ПОЛЬЗОВАТЕЛЕЙ:
 * все остальные тесты создают пользователя через админский API с
 * email_confirm: true. Такой пользователь обходит и отправку письма, и
 * подтверждение адреса. Поэтому сломанная почта была не видна: 27 зелёных
 * проверок, а зарегистрироваться невозможно. Этот шаг закрывает именно
 * эту дыру в тестах.
 *
 * Что считаем провалом:
 *   - ответ 5xx (например «Error sending confirmation email»);
 *   - отсутствие сессии, если подтверждение по почте выключено
 *     (значит человек не сможет войти сразу после регистрации).
 */
async function testPublicSignup() {
  console.log("\n0. Регистрация через форму сайта");

  const email = `e2e-signup-${stamp}@example.com`;

  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: "POST",
    headers: { apikey: ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  const body = await res.text();

  if (res.status >= 500) {
    bad(
      "посетитель не может зарегистрироваться: сервер вернул ошибку",
      `HTTP ${res.status} ${body.slice(0, 160)}. Обычно это неработающая отправка писем (SMTP) на сервере.`,
    );
    return;
  }

  if (!res.ok) {
    bad("регистрация отклонена", `HTTP ${res.status}: ${body.slice(0, 160)}`);
    return;
  }

  let created = null;
  try {
    created = JSON.parse(body);
  } catch {
    bad("ответ регистрации не является JSON", body.slice(0, 160));
    return;
  }

  // Убираем за собой, чтобы тест ничего не оставлял в базе.
  const userId = created?.user?.id || created?.id;
  if (userId) {
    await deleteUser(userId);
  }

  ok("регистрация через форму работает");

  const settingsRes = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
    headers: authHeaders(ANON_KEY),
  });
  const settings = settingsRes.ok ? await settingsRes.json() : null;
  const autoconfirm = settings?.mailer_autoconfirm === true;

  if (autoconfirm) {
    // GoTrue отдаёт сессию плоскими полями (access_token в корне), а не
    // вложенным объектом session — так же, как её показывает supabase-js.
    const hasSession = Boolean(created.session || created.access_token);
    check(
      hasSession,
      "новый пользователь сразу получает сессию и попадает на страницу покупок",
      "сессии в ответе нет, хотя подтверждение выключено — вход будет невозможен",
    );
  } else {
    console.log("   (подтверждение по почте включено — нужна рабочая отправка писем)");
    console.log("        без SMTP новый пользователь не сможет подтвердить адрес и войти.");
  }
}

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

/**
 * 3. Покупатель НЕ может писать в таблицу заказов.
 *
 * Это главная защита от покупки «за копейки»: если бы покупатель мог
 * вставить заказ сам, он подставил бы amount_kopecks = 1, заплатил рубль
 * и получил файл. Поэтому проверяем именно запрет, а не успех.
 * Заказ для дальнейших шагов создаём сервисной ролью — так же, как это
 * делает приложение.
 */
async function testInsertPolicy(userToken) {
  console.log("\n3. Покупатель не может подделать заказ (проверка RLS)");

  const me = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: authHeaders(ANON_KEY, userToken),
  });
  const profile = await me.json();
  const userId = profile?.id;
  if (!userId) {
    bad("не удалось узнать id тестового пользователя", await me.text());
    return null;
  }

  // Атака: вставить заказ с копеечной суммой.
  const attack = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
    method: "POST",
    headers: {
      ...authHeaders(ANON_KEY, userToken),
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      user_id: userId,
      product_id: PRODUCT_ID,
      product_title: "Взлом за копейки",
      amount_kopecks: 1,
      status: "pending",
    }),
  });

  if (attack.ok) {
    // Если база всё-таки вставила строку — это критическая дыра.
    // Убираем за собой, чтобы мусор не остался в базе.
    const created = JSON.parse(await attack.text());
    const row = Array.isArray(created) ? created[0] : created;
    if (row?.id) {
      await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${row.id}`, {
        method: "DELETE",
        headers: authHeaders(SERVICE_KEY),
      });
    }
    bad(
      "КРИТИЧНО: покупатель вставил заказ с произвольной суммой",
      `RLS разрешил INSERT (HTTP ${attack.ok}). Так можно купить файл за копейки. ` +
        `Удалите политику orders_insert_own_pending и выполните SQL заново.`,
    );
    return null;
  }

  ok(`INSERT покупателю запрещён (HTTP ${attack.status})`);

  // Создаём настоящий pending-заказ сервисной ролью — так же, как приложение.
  // Именно он нужен для следующих проверок: бить по несуществующей строке
  // бессмысленно, PostgREST вернёт 204 «всё хорошо» на пустой результат.
  const serverRes = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
    method: "POST",
    headers: {
      ...authHeaders(SERVICE_KEY),
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      user_id: userId,
      product_id: PRODUCT_ID,
      product_title: "Start",
      amount_kopecks: EXPECTED_KOPEKS,
      status: "pending",
    }),
  });

  if (!serverRes.ok) {
    bad("сервер не смог создать заказ через service_role", await serverRes.text());
    return null;
  }

  const created = JSON.parse(await serverRes.text());
  const row = Array.isArray(created) ? created[0] : created;
  const orderId = row?.id;
  ok(`заказ для проверок создан сервером (id=${String(orderId).slice(0, 8)}…)`);
  check(
    row?.amount_kopecks === EXPECTED_KOPEKS,
    "в заказе серверная сумма в копейках",
    `получено ${row?.amount_kopecks}, ожидалось ${EXPECTED_KOPEKS}`,
  );

  // ВАЖНО: дальше проверяем не только код ответа, но и РЕАЛЬНЫЙ результат.
  // PostgREST отвечает 204 даже если не изменил ни одной строки, поэтому
  // единственный честный способ — после атаки перечитать заказ и сравнить.
  const readOrder = async () => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}&select=status,amount_kopecks`, {
      headers: authHeaders(SERVICE_KEY),
    });
    const data = await res.json();
    return Array.isArray(data) ? data[0] : null;
  };

  // Атака 2: поднять заказ до succeeded, чтобы получить файл бесплатно.
  const fakePaid = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`, {
    method: "PATCH",
    headers: {
      ...authHeaders(ANON_KEY, userToken),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: "succeeded", paid_at: new Date().toISOString() }),
  });
  console.log(`   (ответ на попытку UPDATE: HTTP ${fakePaid.status})`);

  const afterUpdate = await readOrder();
  check(
    afterUpdate?.status === "pending",
    "покупатель не может сам отметить заказ оплаченным",
    `статус в базе после попытки: ${afterUpdate?.status}`,
  );

  // Атака 3: попытаться изменить сумму на копейку.
  await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`, {
    method: "PATCH",
    headers: {
      ...authHeaders(ANON_KEY, userToken),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount_kopecks: 1 }),
  });

  const afterAmount = await readOrder();
  check(
    afterAmount?.amount_kopecks === EXPECTED_KOPEKS,
    "покупатель не может изменить сумму заказа",
    `сумма в базе после попытки: ${afterAmount?.amount_kopecks}`,
  );

  // Атака 4: удалить заказ.
  await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`, {
    method: "DELETE",
    headers: authHeaders(ANON_KEY, userToken),
  });

  const afterDelete = await readOrder();
  check(
    afterDelete !== null,
    "покупатель не может удалить заказ",
    "заказ исчез из таблицы после DELETE",
  );

  return row;
}

/** 4. Неоплаченный заказ не выдаёт файл. */
async function testUnpaidDenied(orderId, cookie) {
  console.log("\n4. Неоплаченный заказ не выдаёт файл");

  const res = await fetch(`${APP_URL}/api/download/${orderId}`, {
    headers: { cookie },
    redirect: "manual",
  });
  // 402 «Payment Required» — осмысленный ответ: оплаты нет, поэтому и файла нет.
  check(
    res.status === 402,
    "файл не отдан для неоплаченного заказа",
    `получен HTTP ${res.status}, ожидался 402`,
  );

  const location = res.headers.get("location") || "";
  check(!location.includes("token="), "в отказе нет ссылки на файл", location.slice(0, 80));

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

  // Эндпоинт отдаёт 302 на подписанную ссылку — специально, чтобы токен
  // не попадал в HTML страницы. Поэтому проверяем заголовок Location.
  if (res.status !== 302) {
    bad("ожидался редирект 302 на подписанную ссылку", `получен HTTP ${res.status}`);
    return null;
  }
  ok("оплаченный заказ отдал редирект 302");

  const signedUrl = res.headers.get("location") || "";
  check(
    signedUrl.includes("token=") && signedUrl.includes("paid-files"),
    "в редиректе подписанная ссылка на приватный файл",
    signedUrl.slice(0, 120),
  );
  check(
    !res.headers.get("cache-control")?.includes("max-age=31536000"),
    "ответ не кэшируется прокси",
    res.headers.get("cache-control") || "нет заголовка",
  );

  const fileRes = await fetch(signedUrl, { redirect: "follow" });
  check(fileRes.ok, "файл по ссылке скачивается", `HTTP ${fileRes.status}`);

  const bytes = Buffer.from(await fileRes.arrayBuffer());
  check(
    bytes.length > 0 && bytes.subarray(0, 2).toString() === "PK",
    "скачался настоящий ZIP-архив",
    `первые байты: ${bytes.subarray(0, 4).toString("hex")}, размер ${bytes.length}`,
  );

  return signedUrl;
}

/** 6. Чужой пользователь не может скачать файл. */
async function testIntruderDenied(orderId, intruderCookie) {
  console.log("\n6. Чужой пользователь не может скачать чужой заказ");

  const res = await fetch(`${APP_URL}/api/download/${orderId}`, {
    headers: { cookie: intruderCookie },
    redirect: "manual",
  });
check(
    res.status === 404 || res.status === 403 || res.status === 402,
    "доступ постороннему отказан",
    `получен HTTP ${res.status}, ожидался 403/404`,
  );

  const location = res.headers.get("location") || "";
  check(!location.includes("token="), "постороннему не выдан токен файла", location.slice(0, 80));
}

/** 7. Ключи YooKassa живы: платёж создаётся с чеком. */
async function testYooKassa(orderId) {
  console.log("\n7. Ключи YooKassa");

  const basic = Buffer.from(`${SHOP_ID}:${YOOKASSA_SECRET}`).toString("base64");

  // 7.1. Проверка ключей БЕЗ побочных эффектов: просто читаем платежи.
  // Отвечает 200, если ключи рабочие, и 401, если нет. Ничего не создаём.
  const listRes = await fetch("https://api.yookassa.ru/v3/payments?limit=1", {
    headers: { Authorization: `Basic ${basic}` },
  });
  if (!listRes.ok) {
    bad(
      "ключи YooKassa не работают",
      `HTTP ${listRes.status}: ${(await listRes.text()).slice(0, 200)}. Проверьте ключи и режим.`,
    );
    return;
  }

  const list = await listRes.json();
  ok("ключи YooKassa приняты");
  if (list.items?.length) {
    const mode = list.items[0].test ? "тестовый" : "БОЕВОЙ";
    console.log(`   (кабинет работает в режиме: ${mode})`);
  }

  // 7.2. Создаём платёж ровно тем же запросом, что и приложение, — это
  // главная проверка: без чека YooKassa отвечает 400 и оплата невозможна.
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
      description: `Тариф ${PRODUCT_ID} — GameLand`,
      // Чек обязателен: без него YooKassa отвечает 400 «Receipt is missing
      // or illegal». Формат повторяет lib/yookassa.ts один в один.
      receipt: {
        customer: { email: BUYER_EMAIL },
        items: [
          {
            description: `Тариф ${PRODUCT_ID} — GameLand`,
            quantity: "1.00",
            amount: { value: EXPECTED_RUB, currency: "RUB" },
            vat_code: 3,
            payment_subject: "another",
            payment_mode: "full_payment",
          },
        ],
        vat_code: 3,
        total_amount: { value: EXPECTED_RUB, currency: "RUB" },
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

  // Явная проверка режима. Разница принципиальна: боевой ключ создаёт
  // настоящие платежи в кабинете, пока мы тестируем разработку.
  console.log(
    payment.test
      ? "   (режим: ТЕСТОВЫЙ — деньги не могут списаться, всё в порядке)"
      : "   (ВНИМАНИЕ: режим БОЕВОЙ. Для разработки нужны тестовые ключи.)",
  );
  check(
    payment.amount?.value === EXPECTED_RUB,
    "сумма в YooKassa ровно та, что задана сервером",
    `получено ${payment.amount?.value}, ожидалось ${EXPECTED_RUB}`,
  );
  check(
    typeof payment.confirmation?.confirmation_url === "string",
    "есть ссылка на оплату",
  );

  // Отменяем платёж, чтобы не оставлять мусор в кабинете.
  // Это НЕ провал теста: YooKassa не даёт отменить платёж, который покупатель
  // ещё не подтвердил (статус pending), и отвечает 400. Такой платёж сам
  // истекает, деньги по нему списаться не могут. В самом приложении
  // отмена не используется — её зовёт только этот тест.
  const cancelRes = await fetch(`https://api.yookassa.ru/v3/payments/${payment.id}/cancel`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Idempotence-Key": `e2e-cancel-${stamp}`,
    },
  });

  if (cancelRes.ok || cancelRes.status === 409) {
    ok("тестовый платёж отменён");
  } else {
    console.log(`   [ок] отменить не вышло (HTTP ${cancelRes.status}) — не страшно:`);
    console.log("        платёж остался в статусе pending, деньги не списаны,");
    console.log("        YooKassa сама его со временем уберёт.");
  }
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

/**
 * Предварительная проверка: сайт вообще запущен?
 *
 * Без неё тест падал бы стектрейсом с ECONNREFUSED на середине прогона,
 * и непонятно было бы — это ошибка сайта или просто он не запущен.
 */
async function requireRunningApp() {
  try {
    const res = await fetch(`${APP_URL}/api/health`, {
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error(`\nСайт на ${APP_URL} отвечает HTTP ${res.status}. Запущен ли он правильно?`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`\nСайт на ${APP_URL} недоступен: ${error.cause?.code || error.message}`);
    console.error("Запустите его и повторите: npm run build && npm start");
    process.exit(1);
  }
}

await requireRunningApp();

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

  await testPublicSignup();

  await testGate();

  if (await testSession(buyerCookie)) {
    const order = await testInsertPolicy(buyerSession.access_token);

    if (order?.id) {
      await testUnpaidDenied(order.id, buyerCookie);
      await testPaidGranted(order.id, buyerCookie);
      await testIntruderDenied(order.id, intruderCookie);
    } else {
      bad("пропущены тесты оплаты: не удалось создать заказ");
    }

    // Проверка ключей YooKassa не зависит от заказа, поэтому выполняется
    // всегда — даже если выше что-то сломалось. Иначе одна ошибка в базе
    // маскировала бы ещё и проблему с платёжными ключами.
    await testYooKassa(order?.id ?? "unknown");
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