import LoginForm from "./login-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Вход — GameOnline",
  description: "Войдите, чтобы скачать купленные файлы",
};

/**
 * ПОЧЕМУ ЭТА СТРАНИЦА СЕРВЕРНАЯ (а не "use client", как было раньше)
 * ------------------------------------------------------------------
 * Раньше страница была клиентской и читала параметры адреса через хук
 * `useSearchParams()`. Next.js 16 при генерации страницы во время сборки
 * (`next build`) требует, чтобы любой вызов useSearchParams() находился
 * внутри <Suspense>. Без этого СБОРКА ПАДАЛА:
 *
 *   ⨯ useSearchParams() should be wrapped in a suspense boundary at page "/login"
 *   Export encountered an error on /login/page: /login, exiting the build.
 *
 * Это и была та самая ошибка, из-за которой Docker-деплой не собирался.
 *
 * Решение «правильным способом»: серверный компонент читает searchParams
 * (в Next 16 это Promise) и передаёт готовые значения клиентскому компоненту
 * с формой. Хук useSearchParams() вообще не нужен, а страница снова
 * нормально генерируется при сборке.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  // ВАЖНО: значения из searchParams уже декодированы самим Next.js,
  // поэтому decodeURIComponent() здесь вызывать НЕЛЬЗЯ:
  // он испортит текст, в котором встречается символ «%».
  const error = firstValue(params.error);
  const message = firstValue(params.message);
  const email = firstValue(params.email) ?? "";
  const next = firstValue(params.next);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
      <div className="max-w-md w-full p-8 bg-bg-glass border border-border rounded-2xl">
        <LoginForm
          initialError={error}
          initialMessage={message}
          initialEmail={email}
          nextPath={next}
        />
      </div>
    </div>
  );
}

function firstValue(value: string | string[] | undefined): string | null {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return null;
}