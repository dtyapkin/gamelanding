"use client";

import { useState } from "react";
import { login, signup } from "@/app/auth/actions";
import BuyButton from "@/components/BuyButton";
import { resolveTab } from "@/lib/login-tab";

/**
 * Клиентская часть формы входа/регистрации.
 *
 * Вынесена отдельно от page.tsx, потому что здесь нужен useState
 * (переключение «Вход» ↔ «Регистрация»). Сам параметры адреса читает
 * серверный компонент и передаёт их сюда готовыми.
 *
 * Какая вкладка открыта первой, решает resolveTab() в lib/login-tab.ts —
 * там же объяснение, почему «по умолчанию регистрация» не означает
 * «всегда регистрация».
 */

export default function LoginForm({
  initialError,
  initialMessage,
  initialEmail,
  nextPath,
  initialTab,
}: {
  initialError: string | null;
  initialMessage: string | null;
  initialEmail: string;
  nextPath: string | null;
  initialTab?: string | null;
}) {
  const [isLogin, setIsLogin] = useState(
    resolveTab(initialTab, nextPath !== null) === "login",
  );

  return (
    <>
      {initialError && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-200">
          <strong>Ошибка:</strong> {initialError}
        </div>
      )}

      {initialMessage && (
        <div className="mb-4 p-3 rounded-lg bg-accent-primary/10 border border-accent-primary/30 text-sm text-accent-primary">
          {initialMessage}
        </div>
      )}

      <h1 className="text-2xl font-bold mb-6 text-center">
        {isLogin ? "Вход" : "Регистрация"}
      </h1>

      {isLogin ? (
        <form action={login} className="space-y-4">
          {/* Скрытое поле: после успешного входа вернёмся туда,
              откуда пришли (обычно на /download). */}
          {nextPath && <input type="hidden" name="next" value={nextPath} />}

          <Field
            id="login-email"
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            defaultValue={initialEmail}
          />
          <Field
            id="login-password"
            label="Пароль"
            type="password"
            name="password"
            autoComplete="current-password"
          />

          <BuyButton variant="solid" pendingText="Входим…">
            Войти
          </BuyButton>
        </form>
      ) : (
        <form action={signup} className="space-y-4">
          {nextPath && <input type="hidden" name="next" value={nextPath} />}

          <Field
            id="signup-email"
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            defaultValue={initialEmail}
          />
          <Field
            id="signup-password"
            label="Пароль"
            type="password"
            name="password"
            autoComplete="new-password"
            minLength={6}
          />

          <BuyButton variant="solid" pendingText="Создаём аккаунт…">
            Зарегистрироваться
          </BuyButton>
        </form>
      )}

      <button
        type="button"
        onClick={() => setIsLogin((value) => !value)}
        className="mt-4 w-full text-center text-1xl text-accent-purple hover:text-purple-300 transition-colors"
      >
        {isLogin
          ? "Нет аккаунта? Зарегистрироваться"
          : "Уже есть аккаунт? Войти"}
      </button>

      {/* Блок повторной отправки письма с подтверждением.
          Сейчас скрыт: подтверждение по почте отключено
          (ENABLE_EMAIL_AUTOCONFIRM=true), письма не приходят, и форма
          тут просто вводит в заблуждение. Вернём вместе с нормальным
          почтовым провайдером — до этого места уже доведено, логика
          в app/auth/actions.ts (resendConfirmation) и
          lib/email-resend-limit.ts остаётся нетронутой.

      <div className="mt-6 pt-6 border-t border-border">
        <p className="text-sm text-gray-400 mb-3">
          Не получили письмо с подтверждением?
        </p>
        <form action={resendConfirmation} className="space-y-3">
          <Field
            id="resend-email"
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            defaultValue={initialEmail}
          />
          <button
            type="submit"
            className="w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-sm text-gray-200 hover:border-accent-purple hover:text-white transition-colors"
          >
            Отправить письмо ещё раз
          </button>
        </form>
        <p className="mt-2 text-xs text-gray-500">
          Не чаще одного раза в 3 минуты на один адрес.
        </p>
      </div>
      */}
    </>
  );
}

function Field({
  id,
  label,
  type,
  name,
  autoComplete,
  defaultValue,
  minLength,
}: {
  id: string;
  label: string;
  type: string;
  name: string;
  autoComplete: string;
  defaultValue?: string;
  minLength?: number;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-300 mb-1"
      >
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required
        minLength={minLength}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-white placeholder-gray-500 focus:border-accent-purple focus:outline-none focus:ring-1 focus:ring-accent-purple"
      />
    </div>
  );
}
