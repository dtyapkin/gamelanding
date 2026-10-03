# Статус работы — GameLand

Обновлено: конец сессии 2026-10-02. Точка остановки: **регистрация не работает, ждём решения по SMTP.**

## Тестовая база: 27/27 ✅

```
npm run test:e2e        # 27 пройдено, 0 провалено
npm run lint            # 0 ошибок, 14 предупреждений (<img>)
npm run build           # успешно
```

---

## Что сделано

- **Оплата.** Сайт-заглушка → рабочая оплата: серверный каталог (`lib/products.ts`, цены 300/900/1900 ₽), YooKassa, вебхук с проверкой IP и перезапросом платежа из API, подписанные ссылки на файлы с TTL 60 с.
- **Чек 54-ФЗ.** Найдена причина «оплата не работает»: YooKassa отклоняет запрос без `receipt` (`400 Receipt is missing or illegal`). Добавлен `buildReceipt()` в `lib/yookassa.ts`, email покупателя передаётся через `app/actions/payment.ts` → `lib/checkout.ts`. Переменная `YOOKASSA_VAT_CODE` (по умолчанию `3` = без НДС).
- **Дыра в RLS (была критической).** Покупатель мог вставить заказ с произвольной суммой и купить файл за копейки. `getOrCreatePendingOrder()` переведён на `service_role`; INSERT-политика `orders_insert_own_pending` удалена из `supabase/migrations/0001_orders.sql`. Покупатель теперь не может ничего писать в таблицу заказов.
- **Docker.** Standalone-образ собирается чисто: 20.8 МБ, только рантайм. `npm run build` + `node .next/standalone/server.js` проверено: `health ok:true`, `/download` → 307 на логин, вебхук с чужого IP → 403.
- **Тесты.** `scripts/e2e-test.mjs` проверяет всю цепочку и **сам себя убирает** (в `orders` после прогона 0 строк). Важно: проверки безопасности бьют по существующей строке и сверяют результат в базе — код ответа сам по себе ничего не значит (PostgREST отвечает `204` и на пустой результат).
- **Документация.** `SETUP.md` дополнен: чек обязателен, разбор ошибок `Receipt is missing or illegal` и `Error in shopId or secret key`, `YOOKASSA_VAT_CODE`.
- **Ошибки пользователя.** `app/auth/actions.ts` → `humanSignupError()` переводит английские ошибки Supabase на русские (в т.ч. нерабочую отправку писем).

---

## Что осталось сделать (по порядку)

### 1. 🔴 РЕГИСТРАЦИЯ НЕ РАБОТАЕТ — нужно решение

```
POST /auth/v1/signup → HTTP 500 {"msg":"Error sending confirmation email"}
mailer_autoconfirm: false
```

Self-hosted Supabase без рабочего SMTP + включённое подтверждение = тупик: зарегистрироваться нельзя.

**Вариант А (правильно):** в `.env` контейнера Supabase задать `GOTRUE_SMTP_HOST/PORT/USER/PASS/ADMIN_EMAIL`, перезапустить `auth`. Нужны SMTP-данные.

**Вариант Б (быстро):** `GOTRUE_MAILER_AUTOCONFIRM=true`, перезапустить `auth`. Код уже это поддерживает (`app/auth/actions.ts:68` — при `data.session` сразу пускает на `/download`). Цена: регистрация на любой, даже несуществующей почте.

**Нужно от пользователя:** есть ли доступ к `.env` контейнера Supabase / SSH на хост.

### 2. 🔴 Тестовые ZIP в боевом баке

```
products/start/gameland-start.zip
products/pro/gameland-pro.zip
products/ultimate/gameland-ultimate.zip
```

Все три пути есть, но внутри — заглушки. ⚠️ `npm run check:storage` заливает заглушки с перезаписью — **не запускать после загрузки настоящих файлов**.

### 3. 🟡 Закоммитить и запушить (10 файлов не закоммичены)

Просили разрешения, ответа не было. Без пуша Dockploy не увидит фиксы.

### 4. 🟡 Задеплоить (вручную, Dockploy API даёт 401)

1. Приложение: Dockerfile, репозиторий `dtyapkin/gamelanding`, ветка `main`.
2. **Environment — 6 переменных** (standalone не читает `.env.local`, только настоящие переменные окружения):
   ```
   NEXT_PUBLIC_SUPABASE_URL       https://api.gamedive.ru
   NEXT_PUBLIC_SUPABASE_ANON_KEY  <из .env.local>
   SUPABASE_SERVICE_ROLE_KEY      <из .env.local>
   YOOKASSA_SHOP_ID               <из .env.local>
   YOOKASSA_SECRET_KEY            <из .env.local, test_>
   NEXT_PUBLIC_BASE_URL           https://gamedive.ru
   ```
3. Домен `gamedive.ru` → приложение.
4. YooKassa → уведомления → `https://gamedive.ru/api/webhooks/yookassa`.

После деплоя — прогнать тест по боевому домену тестовой картой.

### 5. 🟢 Перед приёмом денег

- Настоящие ZIP → бакет.
- YooKassa: тестовый → боевой режим, новые ключи, пересборка.
- Одна реальная покупка на минимальную сумму end-to-end.

---

## Принятые риски (пользователь осведомлён, решил оставить)

- **`service_role` не перевыпущен** и лежит в публичном GitHub. Токен живёт до 10 лет, даёт полный доступ к БД и файлам `paid-files`. Проверено сравнением с коммитом `778e74a`: `SUPABASE_SERVICE_ROLE_KEY` и `DOCKPLOY_API_KEY` совпадают.
- `YOOKASSA_SECRET_KEY` перевыпущен.
- Активация новых ключей (`sb_secret_...`) недоступна: кнопки «Create new API keys» на этой версии Supabase нет. Kill-switch — только ротация `JWT_SECRET`, что требует доступа к серверу.

---

## Секреты

- `.env.local` — все ключи, закоммичен быть не может (в `.gitignore`).
- `.env.example` — только заглушки, безопасен.
- **Никогда не выводить значения ключей в чат/логи.**

## Полезно знать

- YooKassa сейчас в **тестовом** режиме: платежи `test: true`, деньги списаться не могут.
- YooKassa не даёт отменить неподтверждённый платёж (`400 Incorrect payment_id`) — в тесте это не считается провалом, такие платежи истекают сами.
- В баке `paid-files` лежит посторонний файл `7figure.docx` — не используется, можно удалить.
- Docker локально не работает (нет демона), проверка образа сделана вручную через standalone.
- Standalone-сборка требует `NEXT_OUTPUT_STANDALONE=1` в **той же** команде, что и `npm run build` (в PowerShell переменная не переживает вызовы).
- `NEXT_PUBLIC_*` зашиваются в код на этапе сборки — после смены ключей обязательна пересборка.