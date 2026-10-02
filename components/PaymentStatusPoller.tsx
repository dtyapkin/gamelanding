"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * «Проверяем оплату…» — компонент, который опрашивает статус заказа.
 *
 * ЧТО ПРОИСХОДИТ:
 *  1. Покупатель оплатил и вернулся на /download с ?order=<id>.
 *  2. Если вебхук YooKassa ещё в пути, сервер показал этот блок.
 *  3. Каждые 2 секунды мы спрашиваем /api/orders/<id>.
 *  4. Как только статус succeeded — вызываем router.refresh(), и сервер
 *     перерисовывает страницу уже с кнопкой «Скачать».
 *
 * Ограничение 60 секунд (30 попыток) — чтобы не слать запросы вечно,
 * если что-то пошло не так.
 *
 * Счётчик попыток живёт в useRef, а НЕ в useState намеренно: иначе
 * каждое увеличение счётчика перезапускало бы эффект вместе с таймером.
 */

const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 30;

export default function PaymentStatusPoller({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [stopped, setStopped] = useState(false);
  const attemptsRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      if (cancelled) return;

      try {
        const response = await fetch(`/api/orders/${orderId}`, {
          cache: "no-store",
          redirect: "manual",
        });

        // Сессия истекла, пока пользователь ждал. Отвечаем 401 — значит,
        // пора обновить страницу: сервер уведёт на страницу входа.
        if (response.status === 401 || response.status === 307) {
          router.refresh();
          return;
        }

        // Если пришёл не JSON (например, HTML-заглушка от прокси),
        // это тоже повод перерисовать страницу, а не бесконечно опрашивать.
        if (!response.headers.get("content-type")?.includes("application/json")) {
          router.refresh();
          return;
        }

        if (response.ok) {
          const data = (await response.json()) as { status: string };

          if (data.status === "succeeded") {
            router.refresh();
            return;
          }

          if (data.status === "canceled" || data.status === "refunded") {
            setStopped(true);
            return;
          }
        }
      } catch {
        // Сеть моргнула — просто попробуем ещё раз на следующей итерации.
      }

      attemptsRef.current += 1;

      if (attemptsRef.current >= MAX_ATTEMPTS) {
        setStopped(true);
      }
    };

    void check();
    const timer = setInterval(() => void check(), POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [orderId, router]);

  return (
    <div className="mb-6 p-5 rounded-2xl border border-accent-purple/40 bg-accent-purple/10">
      <div className="flex items-center gap-3">
        <span
          className={`w-5 h-5 rounded-full border-2 border-accent-purple border-t-transparent ${
            stopped ? "" : "animate-spin"
          }`}
        />
        <p className="font-semibold">
          {stopped ? "Не дождались подтверждения оплаты" : "Проверяем статус оплаты…"}
        </p>
      </div>

      <p className="text-sm text-gray-400 mt-3">
        {stopped
          ? "Обновите страницу через минуту: если деньги списались, доступ появится автоматически. Если нет — напишите нам, разберёмся."
          : "Обычно это занимает пару секунд. Не закрывайте страницу — файл появится здесь автоматически."}
      </p>
    </div>
  );
}