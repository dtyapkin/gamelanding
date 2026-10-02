import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/dal";
import { getProduct } from "@/lib/products";
import { getOrderForUser, reconcileOrderWithYooKassa } from "@/lib/orders";
import { getSignedUrlTtlSeconds, getStorageBucket } from "@/lib/env";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * СКАЧИВАНИЕ ФАЙЛА — единственная точка, где отдаётся платный контент.
 *
 * ПОЧЕМУ ЭТО ОТДЕЛЬНЫЙ API-МАРШРУТ, А НЕ ПРЯМАЯ ССЫЛКА НА СТРАНИЦЕ
 * ---------------------------------------------------------------
 * Если отдать в HTML подписанную ссылку, она попадёт в исходный код страницы:
 *   - пользователь может её переслать кому угодно;
 *   - она попадёт в историю браузера и в логи прокси;
 *   - её невозможно отозвать.
 *
 * Здесь схема другая: в HTML лежит только адрес /api/download/<orderId>.
 * А файл отдаётся по правилам:
 *   1. Проверяем сессию (не залогинен → 401).
 *   2. Ищем заказ и сверяем, что он принадлежит ЭТОМУ пользователю.
 *   3. Проверяем, что заказ оплачен (спрашивая YooKassa, если статус ещё pending).
 *   4. Только после этого генерируем короткоживущую подписанную ссылку
 *      (по умолчанию 60 секунд) и отдаём её в редиректе 302.
 *   5. Ответ помечаем no-store, чтобы прокси и браузер его не кэшировали.
 *
 * Попытка подставить чужой orderId вернёт 404: RLS в базе + явная сверка user_id.
 */

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/download/[orderId]">,
) {
  const { orderId } = await ctx.params;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }

  const order = await getOrderForUser(user.id, orderId);
  if (!order) {
    return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
  }

  let granted = order.status === "succeeded";

  // Если вебхук ещё не успел обработаться — проверяем напрямую в YooKassa.
  if (!granted) {
    const result = await reconcileOrderWithYooKassa(order);
    granted = result.granted;

    if (!granted) {
      return NextResponse.json(
        { error: result.reason ?? "Оплата не подтверждена", status: order.status },
        { status: 402 },
      );
    }
  }

  const product = getProduct(order.product_id);
  if (!product) {
    console.error(`[download] Неизвестный товар в заказе: ${order.product_id}`);
    return NextResponse.json({ error: "Файл не найден" }, { status: 404 });
  }

  const bucket = getStorageBucket();
  const { data, error } = await getSupabaseAdmin()
    .storage.from(bucket)
    .createSignedUrl(product.storagePath, getSignedUrlTtlSeconds(), {
      // Имя файла, которое сохранит браузер покупателя.
      download: product.fileName,
    });

  if (error || !data?.signedUrl) {
    console.error(`[download] Не удалось создать подписанную ссылку: ${error?.message}`);
    return NextResponse.json(
      { error: "Файл временно недоступен. Напишите в поддержку." },
      { status: 500 },
    );
  }

  console.log(
    `[download] Пользователь ${user.id} скачивает ${product.id} ` +
      `(заказ ${order.id}, файл ${product.storagePath})`,
  );

  const response = NextResponse.redirect(data.signedUrl, {
    // 302 (а не 307): адрес подписи одноразовый по времени жизни,
    // кэшировать его нельзя.
    status: 302,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });

  return response;
}