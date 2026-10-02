"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Глобальная страница ошибок.
 *
 * Next.js показывает её, если на сервере произошло исключение.
 * Покупатель не должен видеть стек-трейс или внутренние детали,
 * поэтому здесь только человеческое сообщение и кнопка «Ещё раз».
 */

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // В логи сервера это попадёт и через свой логгер, но для наглядности
    // дублируем в консоль браузера.
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
      <div className="max-w-md w-full p-8 text-center bg-bg-glass border border-border rounded-2xl">
        <h1 className="text-2xl font-bold mb-3">Что-то пошло не так</h1>

        <p className="text-gray-400 mb-6">
          Страница не смогла загрузиться. Попробуйте ещё раз — если не поможет,
          вернитесь на главную или напишите нам.
        </p>

        {error.digest && (
          <p className="text-xs text-gray-500 mb-6">
            Код ошибки: <code className="text-gray-400">{error.digest}</code>
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="px-6 py-3 rounded-xl bg-accent-purple text-white font-bold hover:opacity-90 transition-opacity"
          >
            Попробовать снова
          </button>
          <Link
            href="/"
            className="px-6 py-3 rounded-xl border border-border text-gray-300 hover:border-white/25 transition-colors"
          >
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}