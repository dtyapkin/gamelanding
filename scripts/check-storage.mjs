/**
 * НАСТРОЙКА ХРАНИЛИЩА И ПРОВЕРКА ДОСТУПА
 *
 * Что делает скрипт:
 *   1. создаёт приватный бакет `paid-files` (если его ещё нет);
 *   2. кладёт в него три ZIP по путям из lib/products.ts;
 *   3. ДОКАЗЫВАЕТ, что анонимный посетитель сайта не может получить эти файлы.
 *
 * Запуск:  node scripts/check-storage.mjs
 *
 * Нужен ключ SUPABASE_SERVICE_ROLE_KEY в .env.local — это серверный ключ,
 * он не попадает в браузер. Скрипт читает его из файла и никогда не печатает.
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createZip } from "./zip.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "paid-files";
const MAX_FILE_BYTES = 500 * 1024 * 1024;

/**
 * Пути и цены продуктов. Должны совпадать с lib/products.ts — если
 * разъедутся, покупатель оплатит и не сможет скачать файл.
 * Здесь они продублированы намеренно: скрипт должен быть запускаем
 * обычным `node`, без сборки TypeScript.
 */
const PRODUCTS = [
  { id: "start", path: "products/start/gameland-start.zip", priceKopecks: 30000 },
  { id: "pro", path: "products/pro/gameland-pro.zip", priceKopecks: 90000 },
  { id: "ultimate", path: "products/ultimate/gameland-ultimate.zip", priceKopecks: 190000 },
];

const ZIP_MIME = "application/zip";

// ---------------------------------------------------------------------------
// Чтение .env.local
// ---------------------------------------------------------------------------

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    console.error(`Файл ${filePath} не найден. Скопируйте .env.example в .env.local.`);
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

if (!SUPABASE_URL) {
  console.error("Нет NEXT_PUBLIC_SUPABASE_URL в .env.local");
  process.exit(1);
}
if (!SERVICE_KEY) {
  console.error("Нет SUPABASE_SERVICE_ROLE_KEY в .env.local — скрипту он обязателен.");
  console.error("Возьмите его в Supabase → Project Settings → API → service_role.");
  process.exit(1);
}

function apiHeaders(key) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
  };
}

// ---------------------------------------------------------------------------
// Шаг 1: бакет
// ---------------------------------------------------------------------------

async function ensureBucket() {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket/${BUCKET}`, {
    headers: apiHeaders(SERVICE_KEY),
  });

  if (res.status === 200) {
    console.log(`[ok] Бакет ${BUCKET} уже существует`);
    const bucket = await res.json();
    if (bucket.public === true) {
      console.log("[!] Бакет сейчас ПУБЛИЧНЫЙ. Это дыра: файлы будут доступны всем.");
      console.log("[!] Исправьте в Supabase → Storage → бакет → снять галочку Public.");
      process.exitCode = 1;
    }
    return;
  }

  if (res.status !== 404) {
    console.error(`[ошибка] Проверка бакета: ${res.status} ${await res.text()}`);
    process.exit(1);
  }

  const create = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: "POST",
    headers: { ...apiHeaders(SERVICE_KEY), "Content-Type": "application/json" },
    body: JSON.stringify({
      id: BUCKET,
      name: BUCKET,
      public: false, // обязательно false — это основа защиты
      file_size_limit: MAX_FILE_BYTES,
      allowed_mime_types: null,
    }),
  });

  if (!create.ok) {
    console.error(`[ошибка] Не удалось создать бакет: ${create.status} ${await create.text()}`);
    process.exit(1);
  }

  console.log(`[ok] Создан приватный бакет ${BUCKET} (лимит ${MAX_FILE_BYTES / 1024 / 1024} МБ)`);
}

// ---------------------------------------------------------------------------
// Шаг 2: файлы
// ---------------------------------------------------------------------------

/**
 * Содержимое тестового архива. Помечено как тестовое, чтобы его нельзя
 * было перепутать с настоящим файлом, если забыть заменить.
 */
function testArchiveContent(productId) {
  return [
    "GAMELAND — ТЕСТОВЫЙ АРХИВ",
    "===============================",
    "",
    `Тариф: ${productId}`,
    "",
    "Это НЕ настоящий игровой файл, а проверочная заглушка.",
    "Она создана скриптом scripts/check-storage.mjs, чтобы проверить",
    "полный путь: оплата -> вебхук -> выдача ссылки -> скачивание.",
    "",
    "ЗАМЕНИТЕ этот файл настоящим архивом с тем же именем,",
    "иначе покупатели получат эту заглушку.",
    "",
  ].join("\n");
}

async function uploadFile(product) {
  const zip = createZip("readme.txt", testArchiveContent(product.id));
  const outDir = join(ROOT, ".test-files", product.id);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "gameland.zip"), zip);

  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${product.path}`, {
    method: "POST",
    headers: {
      ...apiHeaders(SERVICE_KEY),
      "Content-Type": ZIP_MIME,
      "x-upsert": "true", // перезаписывать, если файл уже есть
    },
    body: zip,
  });

  if (!res.ok) {
    console.error(`[ошибка] Загрузка ${product.path}: ${res.status} ${await res.text()}`);
    process.exitCode = 1;
    return;
  }

  console.log(`[ok] Загружен ${product.path} (${(zip.length / 1024).toFixed(1)} КБ, тестовая заглушка)`);
}

// ---------------------------------------------------------------------------
// Шаг 3: доказательство безопасности
// ---------------------------------------------------------------------------

/**
 * Проверяем, что файл НЕ отдаётся анонимному посетителю.
 *
 * Это самый важный тест в скрипте. Показываем три вектора атаки,
 * каждый из которых обязан быть отбит:
 *   1. скачать по «публичной» ссылке;
 *   2. получить подписанную ссылку без оплаты;
 *   3. перечислить содержимое бакета.
 *
 * Если хоть один отдаст файл — значит хранилище настроено неверно
 * и любой посетитель сможет скачать ваши файлы бесплатно.
 */
async function verifyPrivate(probes) {
  const target = PRODUCTS[0].path;
  let leaked = false;

  // 1. Публичная ссылка (в бакеты с public = true отдаётся без подписи).
  const publicRes = await fetch(`${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${target}`, {
    headers: { apikey: ANON_KEY || "" },
  });
  const publicOk = publicRes.ok;
  console.log(
    publicOk
      ? `[!!] ДЫРА: аноним скачал файл по публичной ссылке (HTTP ${publicRes.status})`
      : `[ok] Публичная ссылка отбита (HTTP ${publicRes.status})`,
  );
  if (publicOk) leaked = true;

  // 2. Подписанная ссылка, полученная анонимным ключом.
  const signedRes = await fetch(
    `${SUPABASE_URL}/storage/v1/object/sign/${BUCKET}/${target}?expires=60`,
    { method: "POST", headers: apiHeaders(ANON_KEY || "") },
  );
  const signedOk = signedRes.ok;
  console.log(
    signedOk
      ? "[!!] ДЫРА: аноним получил подписанную ссылку без оплаты"
      : `[ok] Выдача подписанной ссылки анониму отбита (HTTP ${signedRes.status})`,
  );
  if (signedOk) leaked = true;

  // 3. Листинг содержимого бакета.
  const listRes = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`, {
    method: "POST",
    headers: apiHeaders(ANON_KEY || ""),
    body: JSON.stringify({ prefix: "products", limit: 100 }),
  });
  const listOk = listRes.ok;
  console.log(
    listOk
      ? "[!!] ДЫРА: аноним видит список файлов в бакете"
      : `[ok] Просмотр содержимого бакета отбит (HTTP ${listRes.status})`,
  );
  if (listOk) leaked = true;

  // Для информации: серверный ключ видит всё (так и должно быть).
  const adminRes = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`, {
    method: "POST",
    headers: apiHeaders(SERVICE_KEY),
    body: JSON.stringify({ prefix: "products", limit: 100 }),
  });
  if (adminRes.ok) {
    const listed = await adminRes.json();
    console.log(`[ok] Серверный ключ видит ${listed.length} объект(ов) — это правильно`);
  }

  if (leaked) {
    console.error("\nИТОГ: хранилище настроено НЕБЕЗОПАСНО. Продавать файлы нельзя.");
    process.exitCode = 1;
  } else {
    console.log("\nИТОГ: файлы недоступны без серверной проверки оплаты.");
  }

  void probes;
}

// ---------------------------------------------------------------------------
// Запуск
// ---------------------------------------------------------------------------

console.log("=== Настройка приватного хранилища ===\n");
await ensureBucket();

for (const product of PRODUCTS) {
  await uploadFile(product);
}

console.log("\n=== Проверка безопасности ===\n");
await verifyPrivate();

if (process.exitCode) {
  console.log("\nСкрипт завершился с ошибками — см. сообщения выше.");
} else {
  console.log("\nГотово. Следующий шаг: scripts/e2e-test.mjs (полный тест оплаты).");
}