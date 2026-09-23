export default function HeroNext() {
  return (
    <section className="relative bg-slate-950 py-20 lg:py-28 overflow-hidden pt-32 pb-20 lg:pt-44 lg:pb-20">
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[150px]" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          <div className="space-y-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-5 h-5 rounded-full bg-accent-purple flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-black"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-300">
                Готовое решение • Запуск за 1 день
              </span>
            </div>

            <h1 className="text-4xl lg:text-5xl xl:text-7xl font-bold text-white leading-[1.1]">
              Готовая игровая витрина
              <br />
              <span className="text-purple-500"> для заработка на рекламе</span>
            </h1>

            <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
              Запустите собственный сайт с каталогом игр. Посетители выбирают
              игру, переходят в Яндекс Игры и играют, а вы получаете деньги за
              рекламу на своей площадке.
            </p>

            <div className="flex gap-3.5 flex-wrap mb-8">
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-xl text-white bg-accent-purple shadow-lg shadow-accent-purple/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent-purple/50 transition-all"
              >
                Купить за 300 ₽ →
              </a>
              <a
                href="https://gamedome.ru"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-xl text-white bg-bg-card border border-border hover:bg-bg-card/80 hover:border-white/25 transition-all"
              >
                Посмотреть сайт
              </a>
            </div>

            <div className="flex gap-6 flex-wrap text-gray-400 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="text-accent-primary font-bold">✓</span> Без
                разработки с нуля
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-accent-primary font-bold">✓</span> Готовая
                структура
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-accent-primary font-bold">✓</span>{" "}
                Рекламные блоки
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl backdrop-blur-sm border border-white/10">
              {/* Путь изменён на /p-1.jpg, так как в Next.js статика лежит в папке public */}
              <img
                src="/p-000.jpg"
                alt="Game Showcase"
                className="w-full object-cover rounded-2xl"
              />

              {/* <div className="absolute bottom-8 left-8 bg-bg-card rounded-2xl p-6 shadow-xl border border-border">
                <div className="text-white font-semibold mb-4 text-sm">
                  Last Cash
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-accent-primary" />
                  <span className="text-gray-400 text-xs">Income</span>
                  <div className="w-3 h-3 rounded-full bg-accent-purple ml-3" />
                  <span className="text-gray-400 text-xs ml-1">Expenses</span>
                </div>
                <div className="flex items-end gap-1 h-24">
                  <div className="flex-1 bg-accent-primary/30 rounded-t h-[40%]" />
                  <div className="flex-1 bg-accent-primary/50 rounded-t h-[60%]" />
                  <div className="flex-1 bg-accent-primary/40 rounded-t h-[50%]" />
                  <div className="flex-1 bg-accent-primary rounded-t h-[80%]" />
                  <div className="flex-1 bg-accent-primary/60 rounded-t h-[55%]" />
                  <div className="flex-1 bg-accent-primary/30 rounded-t h-[45%]" />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
