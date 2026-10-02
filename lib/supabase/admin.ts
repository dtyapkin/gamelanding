import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdminKey, getSupabasePublicEnv } from "@/lib/env";

/**
 * Supabase-клиент с service_role-ключом.
 *
 * ГДЕ ИСПОЛЬЗУЕТСЯ (и только здесь):
 *   - вебхук YooKassa: у него нет пользовательской сессии, а менять статус
 *     заказа нужно обязательно;
 *   - выдача подписанной ссылки на файл ПОСЛЕ того, как доступ уже проверен
 *     вручную (своя проверка: заказ принадлежит пользователю и оплачен).
 *
 * ГДЕ НЕЛЬЗЯ ИСПОЛЬЗОВАТЬ:
 *   - в клиентских компонентах (страница соберётся, но получит 403/секрет утечёт);
 *   - для чтения «запрошенных пользователем» данных без проверки прав.
 *
 * Клиент создаётся лениво (один раз при первом обращении), а не в момент
 * импорта модуля — иначе `next build` падал бы, если переменная окружения
 * не задана на этапе сборки.
 */

let cachedClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const { url } = getSupabasePublicEnv();
  const serviceRoleKey = getSupabaseAdminKey();

  cachedClient = createClient(url, serviceRoleKey, {
    auth: {
      // service_role не должен пытаться обновлять/сохранять сессию.
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  return cachedClient;
}