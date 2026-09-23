export default function HeroNextTwelveNew() {
  return (
    <section className="relative bg-slate-950 py-10 lg:py-18 overflow-hidden">
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-600/5 rounded-full blur-[150px]" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
              <svg
                className="w-4 h-4 text-purple-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-purple-300 text-sm font-medium">
                Простой и доступный бизнес
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-[1.05] tracking-tight">
              Ваш сайт — <br />
              рекламная площадка
              <br />
              <span className="text-purple-400">Яндекса</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-lg">
              Хватит думать, как монетизировать аудиторию — с нашей витриной вы
              подключаетесь к экосистеме Яндекса за 5 минут и начинаете получать
              реальные деньги, без вложений в разработку.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-xl text-white bg-purple-500 shadow-lg shadow-purple-500/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/50 transition-all"
              >
                Купить за 300 ₽ →
              </a>
            </div>
          </div>

          <div className="relative h-[600px] lg:h-[700px]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md">
              <div className="relative rounded-[3rem] overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-300 via-teal-300 to-cyan-400" />
                <img
                  src="/p-20.jpg"
                  alt="Entrepreneur"
                  className="relative w-full h-[500px] lg:h-[600px] object-cover mix-blend-normal"
                />
              </div>
            </div>

            <div className="absolute top-4 right-0 lg:-right-4 z-20 w-56 lg:w-64">
              <div className="bg-purple-500/20 backdrop-blur-xl rounded-3xl p-5 border border-purple-500/30 shadow-2xl shadow-purple-500/20">
                <div className="text-purple-200 text-xs font-medium mb-2">
                  Еженедельные отчисления
                </div>
                <div className="flex items-end justify-between mb-3">
                  <div className="text-white text-2xl font-bold">
                    Партнёрские программы
                  </div>
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/20 rounded-lg">
                    <span className="text-emerald-400 text-xs font-bold">
                      +354%
                    </span>
                  </div>
                </div>
                <div className="flex items-end justify-between gap-1 h-16">
                  {[30, 45, 55, 70, 85, 95, 100].map((h, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-t h-[${h}%] ${i === 6 ? "bg-white" : "bg-purple-400/" + (40 + i * 10)}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* <!-- Card 2: Freedom Score (middle right) --> */}
            <div className="absolute top-1/2 -right-2 lg:-right-8 z-20 w-52 lg:w-60">
              <div className="bg-amber-500/10 backdrop-blur-xl rounded-3xl p-5 border border-amber-500/20 shadow-2xl shadow-amber-500/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-amber-200 text-xs font-medium">
                    Новые способы
                  </div>
                  <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-pink-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </div>
                </div>
                <div className="text-white text-2xl font-bold mb-3">
                  Медийные размещения
                </div>
                <div className="space-y-1 text-xs">
                  <div className="text-amber-100">
                    Использование доступных рекламных форматов, если они
                    подходят площадке.
                  </div>
                </div>
              </div>
            </div>

            {/* <!-- Card 3: Latest Sale (bottom) --> */}
            <div className="absolute bottom-8 left-4 lg:left-0 z-20 w-56 lg:w-64">
              <div className="bg-pink-500/15 backdrop-blur-xl rounded-3xl p-5 border border-pink-500/25 shadow-2xl shadow-pink-500/15">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white text-2xl font-bold">Реклама</div>
                    <div className="text-pink-200 text-xs font-medium mb-1">
                      Размещение рекламы Яндекс <br />
                      на страницах сайта.
                    </div>
                    {/* <!-- <div className="text-pink-200/60 text-xs mt-1">2m ago</div> --> */}
                  </div>
                  <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-pink-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
