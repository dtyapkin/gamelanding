export default function HeroFeatures() {
  return (
    <section className="relative bg-slate-950 py-2 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[150px]" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight tracking-tight">
            Пока есть миллионы любителей игр -<br />
            <span className="relative inline-block">
              <span className="text-purple-400">Зарабатывайте с Yandex</span>
            </span>
          </h2>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 lg:gap-6">
          {/* Card 1: Каталог игр */}
          <div className="group bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 lg:p-7 border border-slate-800 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center mb-5 text-emerald-400 text-xl group-hover:scale-110 transition-transform">
              <svg
                className="w-7 h-7 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 0 1-.657.643 48.39 48.39 0 0 1-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 0 1-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 0 0-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 0 1-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 0 0 .657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 0 0 5.427-.63 48.05 48.05 0 0 0 .582-4.717.532.532 0 0 0-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 0 0 .658-.663 48.422 48.422 0 0 0-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 0 1-.61-.58v0Z"
                />
              </svg>
            </div>
            <h3 className="text-white font-bold text-base mb-2 leading-snug">
              Каталог игр
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Готовая витрина с карточками популярных игр и удобной навигацией.
            </p>
          </div>

          {/* Card 2: Переход в игру */}
          <div className="group bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 lg:p-7 border border-slate-800 hover:border-purple-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1">
            <div className="w-14 h-14 rounded-full bg-purple-500/15 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <svg
                className="w-7 h-7 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                />
              </svg>
            </div>
            <h3 className="text-white font-bold text-base mb-2 leading-snug">
              Переход в игру
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Пользователь нажимает на карточку и переходит к игре на Яндекс
              Играх.
            </p>
          </div>

          {/* Card 3: Рекламные места */}
          <div className="group bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 lg:p-7 border border-slate-800 hover:border-amber-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1">
            <div className="w-14 h-14 rounded-full bg-amber-500/15 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <svg
                className="w-7 h-7 text-amber-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10.05 4.575a1.575 1.575 0 1 0-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 0 1 3.15 0v1.5m-3.15 0 .075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 0 1 3.15 0V15M6.9 7.575a1.575 1.575 0 1 0-3.15 0v8.175a6.75 6.75 0 0 0 6.75 6.75h2.018a5.25 5.25 0 0 0 3.712-1.538l1.732-1.732a5.25 5.25 0 0 0 1.538-3.712l.003-2.024a.668.668 0 0 1 .198-.471 1.575 1.575 0 1 0-2.228-2.228 3.818 3.818 0 0 0-1.12 2.687M6.9 7.575V12m6.27 4.318A4.49 4.49 0 0 1 16.35 15m.002 0h-.002"
                />
              </svg>
            </div>
            <h3 className="text-white font-bold text-base mb-2 leading-snug">
              Рекламные места
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              На сайте предусмотрены места, где можно размещать рекламные блоки.
            </p>
          </div>

          {/* Card 4: Адаптивный дизайн */}
          <div className="group bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 lg:p-7 border border-slate-800 hover:border-pink-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/10 hover:-translate-y-1">
            <div className="w-14 h-14 rounded-full bg-pink-500/15 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <svg
                className="w-7 h-7 text-pink-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                />
              </svg>
            </div>
            <h3 className="text-white font-bold text-base mb-2 leading-snug">
              Адаптивный дизайн
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Корректно отображается на компьютерах, планшетах и смартфонах.
            </p>
          </div>

          {/* Card 5: Быстрый запуск */}
          <div className="group bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 lg:p-7 border border-slate-800 hover:border-teal-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/10 hover:-translate-y-1">
            <div className="w-14 h-14 rounded-full bg-teal-500/15 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <svg
                className="w-7 h-7 text-teal-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
                />
              </svg>
            </div>
            <h3 className="text-white font-bold text-base mb-2 leading-snug">
              Быстрый запуск
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Не нужно разрабатывать сайт с нуля — всё уже готово к
              использованию.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
