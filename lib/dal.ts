import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { LoginTab } from "@/lib/login-tab";

/**
 * СЛОЙ ДОСТУПА К ДАННЫМ (Data Access Layer).
 *
 * Это единственное место в проекте, где мы спрашиваем Supabase «кто сейчас
 * зашёл на сайт». Логика «а имеет ли этот человек право на файл» живёт
 * в lib/orders.ts, а здесь — только аутентификация.
 *
 * Почему так важно централизовать:
 *  - правило Next.js: проверки прав должны быть как можно ближе к данным,
 *    а не «по памяти» в каждой странице (забыть проверку = дыра);
 *  - cache() из React гарантирует, что в рамках одного рендера Supabase
 *    спросит пользователя ОДИН раз, даже если мы вызвам функцию 5 раз.
 */

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();

  // ВАЖНО: именно getUser(), а НЕ getSession().
  // getSession() только читает cookie и не проверяет подпись,
  // поэтому её можно подделать. getUser() ходит в Supabase Auth
  // и валидирует токен.
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Не удалось получить текущего пользователя:", error.message);
    return null;
  }

  return user ?? null;
});

/**
 * То же самое, но для закрытых страниц: если пользователь не залогинен —
 * отправляем его на /login и просим вернуться обратно.
 *
 * @param nextRelativePath куда вернуться после входа (начинается со "/")
 * @param preferredTab какую вкладку открыть на /login. Обязателен к выбору
 *        вызывающим кодом, потому что по одному только next нельзя понять,
 *        кто пришёл: и новый покупатель с кнопки «Купить», и вернувшийся
 *        покупатель со сломавшейся сессией попадают на /login?next=/download.
 *        Разница в намерении: новый покупатель регистрируется, вернувшийся —
 *        входит. См. lib/login-tab.ts.
 */
export async function requireUser(
  nextRelativePath = "/",
  preferredTab: LoginTab = "signup",
): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    redirect(buildLoginUrl(nextRelativePath, preferredTab));
  }

  return user;
}

/** Собирает безопасный URL для входа. */
export function buildLoginUrl(
  nextRelativePath: string,
  preferredTab: LoginTab,
): string {
  const safe = isSafeInternalPath(nextRelativePath) ? nextRelativePath : "/";
  return `/login?next=${encodeURIComponent(safe)}&tab=${preferredTab}`;
}

/**
 * Защита от open redirect: пользователь не должен увести сайт
 * на чужой домен через параметр `next`.
 * Разрешаем только пути, начинающиеся с одного "/" (не "//evil.com").
 */
export function isSafeInternalPath(path: unknown): path is string {
  if (typeof path !== "string") return false;
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//") || path.startsWith("/\\")) return false;
  return true;
}