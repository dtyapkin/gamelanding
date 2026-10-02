"use client";

import { useFormStatus } from "react-dom";

/**
 * Кнопка «Купить», которая умеет показывать состояние отправки.
 *
 * `useFormStatus` — хук из React. Он читает состояние ближайшей родительской
 * формы, поэтому его можно вызывать только ВНУТРИ компонента,
 * который отрендерен внутри <form>. Именно поэтому это отдельный компонент,
 * а не хук прямо в Pricing.
 *
 * Что это даёт: пользователь сразу видит, что клик сработал, и не кликнет
 * ещё раз, пока идёт редирект на страницу оплаты YooKassa.
 */

const VARIANTS = {
  /** Для тарифа START и Ultimate — тёмная кнопка с обводкой. */
  outline:
    "bg-slate-800 border-2 border-accent-purple hover:border-purple-500 hover:bg-accent-purple/10",
  /** Для тарифа PRO — залитая фирменным цветом. */
  solid: "bg-accent-purple text-white shadow-glow hover:shadow-glow-strong",
} as const;

export default function BuyButton({
  children,
  variant = "outline",
  pendingText = "Открываем оплату…",
}: {
  children: React.ReactNode;
  variant?: keyof typeof VARIANTS;
  pendingText?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`block w-full text-center py-4 text-2xl rounded-xl font-normal transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed ${VARIANTS[variant]}`}
    >
      {pending ? pendingText : children}
    </button>
  );
}