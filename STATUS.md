# Статус работы — GameLand

Обновлено: 2026-10-04. Точка остановки: **SMTP настроен, но письма не отправляются — нужна ошибка из логов контейнера `auth`. Сайт при этом полностью рабочий.**

## Тестовая база: 29/29 ✅

```
npm run test:e2e        # 29 пройдено, 0 провалено
npm run lint            # 0 ошибок, 14 предупреждений (<img>)
npm run build           # успешно
```

---

## SMTP: что уже проверено (не гадать, а мерить)

Настройки применены в Dokploy → compose `supabase` (`.env`), значения в auth приходят — это доказано тем, что `ENABLE_EMAIL_AUTOCONFIRM` успешно переключается и влияет на `/auth/v1/settings`.

```
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
SMTP_USER=game.dive@yandex.ru   # пароль приложения Яндекс
SMTP_ADMIN_EMAIL=game.dive@yandex.ru
SMTP_SENDER_NAME=GameLand
ENABLE_EMAIL_AUTOCONFIRM=true   # временно: регистрация работает без письма
```

Проверено и **исключено**:

| Проверка | Результат |
|---|---|
| Учётные данные с моей машины (465, AUTH PLAIN) | `235` — пароль верный |
| DNS `smtp.yandex.ru` **с VPS** | `77.88.21.158` |
| TCP 465 / 587 / 443 **с VPS** | 48 / 47 / 40 мс — открыты |
| TLS-рукопожатие и приветствие Яндекса **с VPS** | `220`, EHLO `250` |
| `EHLO localhost` (Go шлёт именно так) | `250` — Яндекс не против |
| Порт 587 вместо 465 | тоже `500` |

**Отсюда вывод:** сеть VPS в порядке, пароль в порядке, сервер Яндекса в порядке. Ошибка возникает **внутри контейнера `auth`**, и её текст можно увидеть только в логах. Через Dokploy API логи недоступны — нужен просмотр в панели.

Проверка отправки без ломки регистрации (важно: `/auth/v1/recover` врёт и отдаёт `200` даже при неудаче; `/auth/v1/signup` и `/auth/v1/resend` честно отдают `500 Error sending confirmation email`):
создать неподтверждённого пользователя через админский API → `POST /auth/v1/resend {type:"signup"}`.

⚠️ Чтобы сайт не оказался сломанным, `ENABLE_EMAIL_AUTOCONFIRM` сейчас `true`: регистрация работает без письма. Как только письма заработают — переключить на `false`.

---

## Что сделано

- **Оплата.** Сайт-заглушка → рабочая оплата: серверный каталог (`lib/products.ts`, цены 300/900/1900 ₽), YooKassa, вебхук с проверкой IP и перезапросом платежа из API, подписанные ссылки на файлы с TTL 60 с.
- **Чек 54-ФЗ.** Причина «оплата не работает»: YooKassa отклоняет запрос без `receipt` (`400 Receipt is missing or illegal`). Добавлен `buildReceipt()` в `lib/yookassa.ts`, email покупателя идёт через `app/actions/payment.ts` → `lib/checkout.ts`. Переменная `YOOKASSA_VAT_CODE` (по умолчанию `3` = без НДС).
- **Дыра в RLS (была критической).** Покупатель мог вставить заказ с произвольной суммой и купить файл за копейки. `getOrCreatePendingOrder()` переведён на `service_role`; INSERT-политика `orders_insert_own_pending` удалена из `supabase/migrations/0001_orders.sql`. Покупатель теперь не может ничего писать в таблицу заказов.
- **Регистрация (была сломана).** Причина: self-hosted Supabase отклонял любую регистрацию с `500 Error sending confirmation email` (нет SMTP). Включён автоконфирм в Dokploy — см. ниже точную причину, почему прежняя попытка не сработала.
- **Ошибки пользователя.** `app/auth/actions.ts` → `humanSignupError()` переводит английские ошибки Supabase на русские.
- **Деплой.** Приложение живёт на `gamedive.ru`, обновляется автоматически при push в `main` (`autoDeploy = true`).
- **Документация.** `SETUP.md` дополнен: чек обязателен, разбор `Receipt is missing or illegal` и `Error in shopId or secret key`, `YOOKASSA_VAT_CODE`.

---

## Как устроен деплой (важно)

Dokploy: `https://vps.gamedive.ru`, API-база — **`/api`** (НЕ `/api/v1`), заголовок **`x-api-key`**, параметры — обычные query/JSON. В проекте `game` (environment `production`):

- приложение **`gamedive`**, id `3WNCXQ2QQd9HMTXVh7hRd` — GitHub `dtyapkin/gamelanding`, ветка `main`, `buildType = nixpacks`, домен `gamedive.ru` → порт 3000, HTTPS. **`autoDeploy = true`: любой push в `main` деплоится сам.**
- compose **`supabase`**, id `42cz-ivPS1rFn5fAUU-NG` — здесь же крутится Supabase (auth, db, kong, studio).

Переменные окружения приложения уже заполнены (Supabase, service_role, YooKassa test, `YOOKASSA_VAT_CODE=3`, `NEXT_PUBLIC_BASE_URL`).

### Почему путь B сначала не сработал

В `.env` Supabase стоял `GOTRUE_MAILER_AUTOCONFIRM=true`, но он **игнорировался**: compose берёт значение из `${ENABLE_EMAIL_AUTOCONFIRM}`. Настоящий переключатель — `ENABLE_EMAIL_AUTOCONFIRM`. Он был `false`, изменён на `true`, выполнен `compose.redeploy`. Проверка: `/auth/v1/settings` → `mailer_autoconfirm: true`.

⚠️ Цена пути B: регистрация идёт на **любую** почту, письма всё ещё не отправляются. Восстанавливать пароль пока нельзя. Вернуться к SMTP до приёма реальных денег.

---

## Что осталось сделать (по порядку)

### 1. 🟡 Настоящие ZIP в баке

```
products/start/gameland-start.zip
products/pro/gameland-pro.zip
products/ultimate/gameland-ultimate.zip
```

Сейчас внутри — тестовые архивы (решено оставить, чтобы тест оставался честным). ⚠️ `npm run check:storage` заливает заглушки с перезаписью — **не запускать после загрузки настоящих файлов**.

### 2. 🟢 Перед приёмом денег

- YooKassa: тестовый → боевой режим, новые ключи, обновить env в Dokploy, пересборка.
- В кабинете YooKassa прописать уведомления: `https://gamedive.ru/api/webhooks/yookassa`.
- Одна реальная покупка на минимальную сумму end-to-end (проверить и чек).
- По желанию — настроить SMTP и выключить автоконфирм.

---

## Полезно знать

- YooKassa сейчас в **тестовом** режиме: платежи `test: true`, деньги списаться не могут.
- YooKassa не даёт отменить неподтверждённый платёж (`400 Incorrect payment_id`) — в тесте это не провал, такие платежи истекают сами.
- `GET` платежа YooKassa не возвращает `receipt` — фактическая отправка чека подтверждается только успешной оплатой.
- В баке `paid-files` лежит посторонний файл `7figure.docx` — не используется, можно удалить.
- Standalone-сборка требует `NEXT_OUTPUT_STANDALONE=1` в **той же** команде, что и `npm run build` (в PowerShell переменная не переживает вызовы).
- `NEXT_PUBLIC_*` зашиваются в код на этапе сборки — после смены ключей обязательна пересборка.
- Docker локально не работает (нет демона), проверка образа сделана вручную через standalone.

---

## Тесты: важный урок

Прежние 27 проверок создавали пользователя через **админский** API с `email_confirm: true` — этот путь обходил отправку письма и подтверждение, поэтому не видел сломанной регистрации. Добавлен шаг `0`: `POST /auth/v1/signup` анонимным ключом, как форма на сайте. Также добавлена проверка `/api/health` перед прогоном (иначе вместо отчёта был стектрейс `ECONNREFUSED`).

---

## Принятые риски (пользователь осведомлён, решил оставить)

- **`service_role` не перевыпущен** и лежит в публичном GitHub. Токен живёт до 10 лет, даёт полный доступ к БД и файлам `paid-files`. Проверено сравнением с коммитом `778e74a`: `SUPABASE_SERVICE_ROLE_KEY` и `DOCKPLOY_API_KEY` совпадают.
- `YOOKASSA_SECRET_KEY` перевыпущен.
- Активация новых ключей (`sb_secret_...`) недоступна: кнопки «Create new API keys» на этой версии Supabase нет. Kill-switch — только ротация `JWT_SECRET`, что требует доступа к серверу.

## Секреты

- `.env.local` — все ключи, закоммичен быть не может (в `.gitignore`).
- `.env.example` — только заглушки, безопасен.
- **Никогда не выводить значения ключей в чат/логи.**
