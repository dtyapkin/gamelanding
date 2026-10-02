import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * PROXY (в Next.js 16 middleware переименована в proxy).
 *
 * ВЫПОЛНЯЕТСЯ ДО КАЖДОГО ЗАПРОСА К СТРАНИЦАМ и делает две вещи:
 *
 * 1) Обновляет cookie сессии Supabase.
 *    Токен Supabase живёт ~1 час. Если он протух, а пользователь продолжает
 *    работать с сайтом, без этого шага его «выкинет» на страницу входа
 *    посреди оплаты. Здесь мы один раз обновляем токен и кладём новые cookie
 *    в ответ. Быстро: сеть мы трогаем только тогда, когда cookie с сессией
 *    реально есть.
 *
 * 2) Дешёвая (оптимистичная) проверка доступа к закрытым адресам.
 *    Если cookie сессии нет вообще — отправляем на /login.
 *    ЭТО НЕ НАСТОЯЩАЯ ЗАЩИТА, а быстрый фильтр: настоящая проверка прав
 *    обязательно делается в Server Component страницы (requireUser) и в API
 *    скачивания. Если злоумышленник подделает cookie, он упрётся там.
 */

const PROTECTED_PREFIXES = ["/download", "/api/download", "/api/orders"];

/** Cookie, которую Supabase использует для хранения сессии. */
function hasSupabaseSessionCookie(request: NextRequest): boolean {
  return request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-") && cookie.name.endsWith("-auth-token"));
}

export async function proxy(request: NextRequest) {
  // Быстрый путь: если cookie сессии нет, ничего обновлять не нужно.
  if (!hasSupabaseSessionCookie(request)) {
    return redirectIfUnauthenticated(request);
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Пишем cookie и в запрос (чтобы видели серверные компоненты),
          // и в ответ (чтобы браузер их сохранил).
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }

          response = NextResponse.next({ request });

          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // getClaims() проверяет подпись JWT локально и НЕ ходит в сеть —
  // именно поэтому он подходит для слоя маршрутизации.
  // Если токен протух, мы НЕ выкидываем пользователя здесь: пусть страница
  // сама решит, нужен ли вход.
  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims?.sub);

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix),
  );

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

function redirectIfUnauthenticated(request: NextRequest) {
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix),
  );

  if (!isProtected) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    /*
     * Прокси НЕ должен запускаться на:
     *  - статике (/_next/static, /_next/image),
     *  - файлах из public (картинки, шрифты),
     *  - API вебхука YooKassa — иначе проверка сессии сломала бы приём платежей.
     */
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest|txt|xml|woff2?)$).*)",
  ],
};