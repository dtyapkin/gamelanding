import { NextResponse } from "next/server";
import { collectEnvReport } from "@/lib/env";
import { listProducts } from "@/lib/products";

/**
 * /api/health — диагностика «почему контейнер падает».
 *
 * Docker и балансировщики периодически дёргают этот адрес (см. HEALTHCHECK
 * в Dockerfile). Но главная польза для вас: адрес возвращает список
 * переменных окружения и говорит, какие из них НЕ заданы.
 *
 * Значения секретов не раскрываются — только факт наличия.
 * Если у вас приватный сайт и нет реверс-прокси, закройте этот адрес
 * в nginx (см. SETUP.md).
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const env = collectEnvReport();
  const missing = env.filter((item) => item.required && !item.present).map((item) => item.name);

  return NextResponse.json(
    {
      ok: missing.length === 0,
      missingEnvVars: missing,
      env,
      products: listProducts().map((product) => ({
        id: product.id,
        priceKopecks: product.priceKopecks,
        storagePath: product.storagePath,
      })),
      timestamp: new Date().toISOString(),
    },
    {
      // Если переменных не хватает — отвечаем 503, чтобы Docker помечал
      // контейнер как нездоровый и вы могли увидеть это в логах.
      status: missing.length === 0 ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}