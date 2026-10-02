import type { NextConfig } from "next";

/**
 * КОНФИГУРАЦИЯ NEXT.JS
 *
 * Здесь три вещи, важные для продакшена:
 *  1. output: "standalone" — Next.js при сборке создаёт минимальный сервер
 *     со всеми нужными файлами. Docker-образ получается в разы меньше,
 *     и в него не попадают dev-зависимости.
 *
 *     ПОЧЕМУ ЭТО УСЛОВНО: режим standalone несовместим с `next start`
 *     (Next.js пишет предупреждение). Поэтому включаем его только для
 *     Docker-сборки: Dockerfile задаёт NEXT_OUTPUT_STANDALONE=1.
 *     Локально и на любом хостинге, где вы запускаете `npm start`,
 *     переменная не задана — и предупреждения не будет.
 *
 *  2. serverExternalPackages — YooKassa SDK не бандлится в серверный код,
 *     а подключается как обычная Node-библиотека. Это надёжнее: у SDK
 *     есть необязательные зависимости для прокси.
 *  3. headers — базовые защитные заголовки HTTP.
 */
const nextConfig: NextConfig = {
  output: process.env.NEXT_OUTPUT_STANDALONE === "1" ? "standalone" : undefined,

  serverExternalPackages: ["@webzaytsev/yookassa-ts-sdk"],

  async headers() {
    return [
      {
        // Заголовки безопасности для всего сайта.
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        // Ответы "проверки оплаты" и "выдачи файла" нельзя кэшировать:
        // иначе nginx/browser могли бы отдать файл тому, кто уже не оплатил.
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
    ];
  },
};

export default nextConfig;