/**
 * КАТАЛОГ ТОВАРОВ — единственный источник правды о ценах и файлах.
 *
 * ГЛАВНОЕ ПРАВИЛО БЕЗОПАСНОСТИ:
 *   Цена НИКОГДА не приходит из браузера.
 *   Раньше в `createPayment(productId, amount)` сумму передавал клиент,
 *   а значит любой мог подменить её в DevTools и купить тариф за 1 рубль.
 *   Теперь браузер присылает только `productId` ("start" | "pro" | "ultimate"),
 *   а цену и путь к файлу сервер берёт отсюда.
 *
 * Файл каждого тарифа лежит в приватном бакете Supabase Storage
 * (см. getStorageBucket() в lib/env.ts) по фиксированному пути.
 * Чтобы поменять цену: отредактируйте здесь и (если цена изменилась
 * у уже оформленных заказов) ничего менять не нужно — у заказа сохранена
 * копия суммы на момент покупки.
 */

export const PRODUCT_IDS = ["start", "pro", "ultimate"] as const;

export type ProductId = (typeof PRODUCT_IDS)[number];

export interface Product {
  /** Идентификатор, который передаёт браузер. */
  id: ProductId;
  /** Название тарифа (как на лендинге). */
  title: string;
  /** Короткое описание для письма/страницы заказа. */
  description: string;
  /** Цена В КОПЕЙКАХ (целое число). 300 рублей = 30000. */
  priceKopecks: number;
  /** Цена в рублях — только для показа, ничего не вычисляет. */
  priceRubles: number;
  /** Путь к файлу внутри приватного бакета Supabase Storage. */
  storagePath: string;
  /** Имя файла, которое увидит покупатель при скачивании. */
  fileName: string;
}

export const PRODUCTS: Record<ProductId, Product> = {
  start: {
    id: "start",
    title: "START",
    description: "Готовая игровая витрина с каталогом игр и рекламными местами",
    priceKopecks: 30000,
    priceRubles: 300,
    storagePath: "products/start/gameland-start.zip",
    fileName: "gameland-start.zip",
  },
  pro: {
    id: "pro",
    title: "PRO",
    description: "Расширенная версия: больше рекламных блоков и настройки SEO",
    priceKopecks: 90000,
    priceRubles: 900,
    storagePath: "products/pro/gameland-pro.zip",
    fileName: "gameland-pro.zip",
  },
  ultimate: {
    id: "ultimate",
    title: "ULTIMATE",
    description: "Полное развёртывание «под ключ»: домен, SSL, бэкапы, SEO",
    priceKopecks: 190000,
    priceRubles: 1900,
    storagePath: "products/ultimate/gameland-ultimate.zip",
    fileName: "gameland-ultimate.zip",
  },
};

/** Список всех товаров (для страницы тарифов и отчётов). */
export function listProducts(): Product[] {
  return PRODUCT_IDS.map((id) => PRODUCTS[id]);
}

/**
 * Безопасное получение товара по id из пользовательского ввода.
 * Возвращает null, если id неизвестен — тогда показываем 404, а не падаем.
 */
export function getProduct(id: unknown): Product | null {
  if (typeof id !== "string") return null;
  const normalized = id.trim().toLowerCase();
  return (PRODUCTS as Record<string, Product>)[normalized] ?? null;
}

export function isProductId(id: unknown): id is ProductId {
  return getProduct(id) !== null;
}