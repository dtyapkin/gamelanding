import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/dal";
import { getOrderForUser, reconcileOrderWithYooKassa } from "@/lib/orders";

/**
 * СТАТУС ЗАКАЗА ДЛЯ ОПРОСА (polling).
 *
 * Зачем: покупатель вернулся с сайта YooKassa, а вебхук ещё в пути
 * (обычная задержка 1–5 секунд). Вместо сообщения «оплата не получена»
 * страница /download спрашивает этот эндпоинт каждые 2 секунды,
 * пока статус не станет succeeded (максимум 60 секунд).
 *
 * Эндпоинт ТОЖЕ делает сверку с YooKassa — то есть он не только показывает
 * состояние базы, но и «лечит» задержавшийся вебхук.
 *
 * Ответ содержит только статус и безопасные поля: никаких ключей и сумм,
 * чтобы этот адрес нельзя было использовать для перебора чужих заказов.
 */

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/orders/[orderId]">,
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

  let current = order;

  // Пока заказ не оплачен, уточняем реальный статус у YooKassa.
  if (order.status !== "succeeded") {
    const result = await reconcileOrderWithYooKassa(order);
    current = result.order;
  }

  return NextResponse.json(
    {
      orderId: order.id,
      status: current.status,
      productId: order.product_id,
      paidAt: current.paid_at,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}