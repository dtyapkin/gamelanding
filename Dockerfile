# =============================================================================
#  DOCKER ДЛЯ ПРОДАКШЕНА (Next.js 16 standalone)
# =============================================================================
#  Собрать образ:
#     docker build -t gameland .
#  Запустить:
#     docker run -d -p 3000:3000 --env-file .env.production gameland
#
#  Почему несколько стадий (stages):
#     dependencies — ставим только node_modules для СБОРКИ;
#     builder       — собираем приложение (next build);
#     runner        — копируем ТОЛЬКО .next/standalone и нужные node_modules.
#     В итоговый образ не попадают dev-зависимости, исходники и .env,
#     поэтому образ весит ~200 МБ вместо ~1.5 ГБ.
# =============================================================================

# ---------- Стадия 1: зависимости ----------
FROM node:22-alpine AS dependencies
WORKDIR /app

# package.json + package-lock.json копируем отдельно, чтобы слой с
# зависимостями пересобирался только при их изменении (быстрее деплой).
COPY package.json package-lock.json ./
RUN npm ci

# ---------- Стадия 2: сборка ----------
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# Переменные с префиксом NEXT_PUBLIC_ Next.js ВСТРАИВАЕТСЯ в код на этапе
# сборки. Поэтому, если клиентский код когда-нибудь начнёт обращаться
# к Supabase из браузера, эти два значения нужно передать и сюда.
# Сейчас браузер к Supabase не ходит, поэтому сборка не зависит от них.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# Включает output: "standalone" в next.config.ts — для Docker это обязательно,
# иначе в образ попадут все dev-зависимости (подробности в комментарии
# к переменной в next.config.ts).
ENV NEXT_OUTPUT_STANDALONE=1
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ---------- Стадия 3: запуск ----------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Запускаем не от root — стандартная практика безопасности в Docker.
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# standalone-сервер Next.js и минимальный набор node_modules.
# Он сам читает process.env в рантайме, поэтому секреты можно задать
# при запуске контейнера (docker run --env-file), а не зашивать в образ.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Проверка живости: Docker будет считать контейнер здоровым, пока
# /api/health отвечает 200. По нему же удобно смотреть логи проблем.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]