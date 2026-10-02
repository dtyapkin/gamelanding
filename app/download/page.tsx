import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/dal";
import {
  getPaidOrders,
  getOrderForUser,
  getPendingOrdersForUser,
  reconcileOrderWithYooKassa,
} from "@/lib/orders";
import { getProduct } from "@/lib/products";
import { formatKopecks } from "@/lib/money";
import { logout } from "@/app/auth/actions";
import PaymentStatusPoller from "@/components/PaymentStatusPoller";

/**
 * СТРАНИЦА ПОСЛЕ ОПЛАТЫ — то самое «закрытое» место, о котором вы просили.
 *
 * ПОЧЕМУ НА ЭТУ СТРАНИЦУ НЕЛЬЗЯ ПОПАСТЬ ПРОСТО ТАК
 * ---------------------------------------------------
 *  1. requireUser() уводит неавторизованного посетителя на /login
 *     (с параметром next=, чтобы после входа вернуться сюда).
 *  2. Даже авторизованному пользователю показывается НЕ файл, а лишь кнопки
 *     «Скачать» для тех заказов, у которых status = 'succeeded'.
 *  3. Сама отдача файла происходит в /api/download/[orderId], который ещё раз
 *     всё проверяет. Даже если кто-то узнает адрес, чужие заказы не отдадутся.
 *
 * АВТОМАТИЧЕСКАЯ «САМОПОЧИНКА» ОПЛАТЫ
 * -----------------------------------
 * Страница не доверяет только вебхуку: если в ?order= пришёл id заказа,
 * мы напрямую спрашиваем YooKassa о статусе платежа. Благодаря этому
 * покупатель не увидит «оплата не получена», даже если вебхук задержался.
 * А кнопка «Обновить статус» перепроверяет все незавершённые заказы
 * на случай, если вебхук потерялся совсем.
 */

type SearchParams = Record<string, string | string[] | undefined>;

const ERROR_MESSAGES: Record<string, string> = {
  unknown_product: "Такого тарифа не существует. Выберите тариф на главной странице.",
  no_email:
    "У вашего аккаунта не указан email, поэтому мы не можем отправить чек об оплате. Добавьте email в профиле и попробуйте снова.",
  payment_failed:
    "Не удалось создать платёж в платёжной системе. Попробуйте ещё раз через минуту — деньги при этом не списывались.",
};

function firstValue(value: string | string[] | undefined): string | null {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return null;
}

/**
 * Ручная перепроверка статусов платежей у YooKassa.
 *
 * Кнопка «Обновить статус». Нужна покупателю в одной ситуации: вебхук
 * потерялся (неверный адрес, перезагрузка контейнера, фильтр), и без
 * ручной проверки он вообще никак не смог бы получить оплаченный файл.
 */
async function recheckOrdersAction(): Promise<void> {
  const user = await requireUser("/download");
  const pending = await getPendingOrdersForUser(user.id);

  for (const order of pending) {
    await reconcileOrderWithYooKassa(order);
  }

  revalidatePath("/download");
}

export default async function DownloadPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await requireUser("/download");
  const params = await searchParams;

  const errorCode = firstValue(params.error);
  const errorMessage = errorCode ? (ERROR_MESSAGES[errorCode] ?? null) : null;
  const alreadyPaid = firstValue(params.order_created) === "already_paid";

  // --- Заказ, к которому вернулся покупатель с сайта YooKassa -----------
  const focusId = firstValue(params.order);
  let focusOrderId: string | null = null;
  let focusPending = false;

  if (focusId) {
    const order = await getOrderForUser(user.id, focusId);

    if (order && order.status !== "succeeded") {
      // Спрашиваем YooKassa напрямую — вебхук мог ещё не прийти.
      const result = await reconcileOrderWithYooKassa(order);
      focusOrderId = order.id;
      focusPending = !result.granted;
    }
  }

  // --- Все покупки пользователя ----------------------------------------
  const paidOrders = await getPaidOrders(user.id);
  const hasAnything = paidOrders.length > 0;

  // Заказы, по которым платёж ещё не подтверждён: для них нужна кнопка
  // «Обновить статус» — это страховка, если вебхук не дошёл.
  const pendingOrders = hasAnything
    ? []
    : (await getPendingOrdersForUser(user.id)).filter(
        (order) => order.id !== focusOrderId || focusPending,
      );

  return (
    <div className="min-h-screen bg-bg-primary px-4 py-12 sm:py-16">
      <div className="max-w-3xl mx-auto">
        {/* Шапка */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">
            ← На главную
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Выйти
            </button>
          </form>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Мои покупки</h1>
        <p className="text-gray-400 mb-8">
          Вы вошли как <span className="text-white">{user.email}</span>
        </p>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200">
            {errorMessage}
          </div>
        )}

        {alreadyPaid && (
          <div className="mb-6 p-4 rounded-xl bg-accent-primary/10 border border-accent-primary/30 text-accent-primary">
            Этот тариф уже оплачен — его файлы доступны ниже.
          </div>
        )}

        {focusPending && focusOrderId && (
          <PaymentStatusPoller orderId={focusOrderId} />
        )}

        {hasAnything ? (
          <ul className="space-y-4">
            {paidOrders.map((order) => {
              const product = getProduct(order.product_id);

              return (
                <li
                  key={order.id}
                  className="p-5 rounded-2xl bg-bg-glass border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <p className="text-xl font-bold">
                      Тариф {product?.title ?? order.product_title}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Заказ №{order.id.slice(0, 8)} · {formatKopecks(order.amount_kopecks)}
                      {order.paid_at && ` · оплачен ${formatDate(order.paid_at)}`}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Файл: {product?.fileName ?? "—"}
                    </p>
                  </div>

                  {/* Это НЕ прямая ссылка на файл, а адрес нашего гейта:
                      доступ проверяется на сервере заново при каждом клике. */}
                  <a
                    href={`/api/download/${order.id}`}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-primary text-bg-primary font-bold whitespace-nowrap hover:opacity-90 transition-opacity"
                  >
                    <DownloadIcon />
                    Скачать
                  </a>
                </li>
              );
            })}
          </ul>
        ) : (
          !focusPending && (
            <div className="text-center p-10 rounded-2xl bg-bg-glass border border-border">
              <h2 className="text-2xl font-bold mb-3">Покупок пока нет</h2>
              <p className="text-gray-400 mb-6">
                После оплаты файлы появятся здесь автоматически.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/#pricing"
                  className="inline-block px-8 py-4 rounded-xl bg-accent-purple text-white font-bold hover:opacity-90 transition-opacity"
                >
                  Выбрать тариф
                </Link>

                {/* Есть незавершённый платёж, но он не подтвердился.
                    Вебхук мог потеряться — даём покупателю «додавить» проверку. */}
                {pendingOrders.length > 0 && (
                  <form action={recheckOrdersAction}>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-6 py-4 rounded-xl border border-border text-gray-300 hover:border-white/25 transition-colors"
                    >
                      Обновить статус оплаты
                    </button>
                  </form>
                )}
              </div>

              {pendingOrders.length > 0 && (
                <p className="text-xs text-gray-500 mt-4">
                  Оплата ещё не подтверждена. Обычно это занимает несколько секунд.
                  <br />
                  Если деньги точно списались, а файл не появился — нажмите
                  «Обновить статус оплаты».
                </p>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function DownloadIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  );
}