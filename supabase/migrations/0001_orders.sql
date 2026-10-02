-- =============================================================================
--  СХЕМА БД ДЛЯ ОПЛАТЫ И СКАЧИВАНИЯ  (Supabase / PostgreSQL)
-- =============================================================================
--  КАК ЗАПУСТИТЬ
--  ------------
--  Вариант А (проще): Supabase Dashboard -> SQL Editor -> вставить весь файл
--                     -> Run. Файл идемпотентный, его можно запускать повторно.
--
--  Вариант Б:      npx supabase db push      (если у вас настроен проект)
--
--  ЧТО ДЕЛАЕТ ФАЙЛ
--  --------------
--  1. Таблица orders — заказы покупателя.
--  2. Уровни защиты (RLS) — чтобы покупатель видел ТОЛЬКО свои заказы
--     и НЕ МОГ сам отметить заказ как оплаченный.
--  3. Приватный бакет paid-files в Supabase Storage + правила доступа.
--  4. Удобные представления (view) для отчётов.
--
--  БЕЗОПАСНОСТЬ ГЛАВНОЕ ПРАВИЛО ЭТОГО ФАЙЛА
--  ---------------------------------------
--  Пользователь (роль authenticated) умеет ТОЛЬКО:
--      SELECT   свои заказы
--      INSERT   свои заказы (и только со статусом 'pending')
--  Всё остальное (UPDATE / DELETE / смена статуса на succeeded) доступно
--  исключительно service_role, то есть нашему серверу.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. ТАБЛИЦА ЗАКАЗОВ
-- -----------------------------------------------------------------------------
create table if not exists public.orders (
  -- UUID генерирует сама база.
  id                  uuid primary key default gen_random_uuid(),

  -- Ссылка на пользователя Supabase Auth.
  -- ON DELETE CASCADE: если удалить аккаунт, удалятся и заказы.
  user_id             uuid not null references auth.users (id) on delete cascade,

  -- Идентификатор тарифа. Значения должны совпадать с ключами в
  -- lib/products.ts: 'start' | 'pro' | 'ultimate'.
  -- Сделано текстом, а не внешним ключом, чтобы каталог товаров жил
  -- в коде (единственный источник правды о ценах).
  product_id          text not null,

  -- Копия названия на момент покупки: если переименуем тариф в коде,
  -- в старых заказах останется то, что человек реально купил.
  product_title       text not null,

  -- ДЕНЬГИ = ЦЕЛОЕ ЧИСЛО КОПЕЕК. Никогда не float!
  -- 300 рублей хранится как 30000.
  amount_kopecks      integer not null check (amount_kopecks > 0),

  -- Статусы заказа:
  --   pending    — создан, ждём оплаты
  --   succeeded  — оплата подтверждена (доступ к файлу разрешён)
  --   canceled   — покупатель отменил или оплата не прошла
  --   refunded   — возврат
  status              text not null default 'pending'
                        check (status in ('pending', 'succeeded', 'canceled', 'refunded')),

  -- id платежа в YooKassa.
  yookassa_payment_id text,

  -- Ключ идемпотентности: гарантирует, что при двойном клике
  -- не создастся второй платёж (см. lib/yookassa.ts).
  idempotency_key     text unique,

  created_at          timestamptz not null default now(),
  paid_at             timestamptz
);

-- Индексы: почти все запросы идут по (user_id, status).
create index if not exists orders_user_id_idx       on public.orders (user_id);
create index if not exists orders_user_status_idx   on public.orders (user_id, status);
create index if not exists orders_payment_id_idx    on public.orders (yookassa_payment_id);
create index if not exists orders_created_at_idx    on public.orders (created_at desc);

-- Защита от двойного «неоплаченного» заказа на один тариф.
-- Именно на эту ошибку (23505) опирается getOrCreatePendingOrder() в коде:
-- если два запроса пришли одновременно, второй увидит конфликт
-- и просто переиспользует заказ первого.
create unique index if not exists orders_one_pending_per_user_product_idx
  on public.orders (user_id, product_id)
  where status = 'pending';

-- -----------------------------------------------------------------------------
-- 2. УРОВНИ ЗАЩИТЫ (ROW LEVEL SECURITY)
-- -----------------------------------------------------------------------------
-- RLS = «каждый ряд таблицы может быть прочитан/изменён только если
-- выполняется условие в политике». Это главный механизм защиты в Supabase:
-- даже если кто-то узнает адрес таблицы, он не обойдёт правила.

alter table public.orders enable row level security;

-- Удаляем старые политики, чтобы файл можно было запускать повторно.
drop policy if exists "orders_select_own" on public.orders;
drop policy if exists "orders_insert_own_pending" on public.orders;

-- Покупатель видит только свои заказы.
create policy "orders_select_own"
  on public.orders
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Покупатель может создать заказ, но:
--   - только от своего имени (user_id = auth.uid()),
--   - и только со статусом 'pending'.
-- Проверка статуса в политике — важна: даже если злоумышленник подставит
-- status = 'succeeded' в свой INSERT, база его отклонит.
create policy "orders_insert_own_pending"
  on public.orders
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and status = 'pending'
  );

-- ВАЖНО: политик на UPDATE и DELETE НЕТ вообще.
-- Ни authenticated, ни anon не могут менять статус заказа.
-- Меняет статус только наш сервер через service_role (вебхук YooKassa
-- и проверка по требованию). Поэтому «нарисовать» себе оплату невозможно.

-- -----------------------------------------------------------------------------
-- 3. ПРИВАТНЫЙ БАКЕТ ДЛЯ ФАЙЛОВ
-- -----------------------------------------------------------------------------
-- Бакет закрытый (public = false): прямые ссылки вида
-- https://<project>.supabase.co/storage/v1/object/public/paid-files/... НЕ работают.
-- Файлы отдаются только через подписанные ссылки, которые мы выдаём
-- после проверки оплаты.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'paid-files',
  'paid-files',
  false,
  524288000,          -- 500 МБ максимум на файл
  null                -- любые типы файлов
)
on conflict (id) do update
  set public = false;

-- Политики доступа к самому бакету для обычных пользователей:
--   - скачивать файлы напрямую из браузера нельзя (никаких SELECT-политик),
--   - загружать/удалять файлы может только наш сервер (service_role).
-- Файл отдаётся исключительно через подписанную ссылку,
-- которую создаёт сервер в /api/download/[orderId].
--
-- ВАЖНО: политики в storage.objects действуют на ВСЕ бакеты проекта,
-- поэтому каждую мы явно ограничиваем условием bucket_id = 'paid-files'.
-- Без этого мы бы случайно заблокировали и другие бакеты.

drop policy if exists "paid_files_no_public_read"  on storage.objects;
drop policy if exists "paid_files_no_user_insert"  on storage.objects;
drop policy if exists "paid_files_no_user_delete"  on storage.objects;

create policy "paid_files_no_public_read"
  on storage.objects
  for select
  to public
  using (bucket_id = 'paid-files' and false);

create policy "paid_files_no_user_insert"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'paid-files' and false);

create policy "paid_files_no_user_delete"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'paid-files' and false);

-- -----------------------------------------------------------------------------
-- 4. ПРЕДСТАВЛЕНИЕ ДЛЯ ОТЧЁТОВ (выручка по тарифам)
-- -----------------------------------------------------------------------------
create or replace view public.paid_orders_summary
with (security_invoker = true) as
select
  product_id,
  max(product_title)          as product_title,
  count(*)::integer           as orders_count,
  sum(amount_kopecks)::bigint as total_kopecks
from public.orders
where status = 'succeeded'
group by product_id;

-- Готово. Дальше:
--   1) загрузите файлы в бакет paid-files по путям из lib/products.ts:
--        products/start/gameland-start.zip
--        products/pro/gameland-pro.zip
--        products/ultimate/gameland-ultimate.zip
--   2) проверьте, что бакет приватный: Supabase Dashboard -> Storage -> paid-files
--