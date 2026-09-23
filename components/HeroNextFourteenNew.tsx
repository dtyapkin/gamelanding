export default function HeroNextFourteenNew() {
  const features = [
    "Покупка",
    "Установка",
    "Регистрация в Yandex",
    "Заработок",
  ];
  return (
    <section
      id="income"
      className="relative bg-slate-950 py-10 lg:py-18 overflow-hidden"
    >
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-pink-600/5 rounded-full blur-[150px]" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
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
                Готовая платформа для заработка
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
              Запусти и зарабатывай <br />
              <span className="text-purple-500">с первого дня.</span>
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              Все лучшие игры. Игровой каталог, который всегда под рукой.
              Выбирай, запускай, увлекайся.
            </p>
            <p className="text-slate-300 text-base leading-relaxed">
              Простая витрина, которую хочется открывать
            </p>
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-xl text-white bg-purple-500 shadow-lg shadow-purple-500/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/50 transition-all"
            >
              Купить за 300 ₽ →
            </a>
          </div>

          <div className="lg:col-span-3 relative space-y-4">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-purple-500/15 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/25 hover:border-purple-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10"
              >
                <div className="flex">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-4 pl-1 pt-1">
                    <svg
                      className="w-7 h-7 text-accent-purple"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div className="flex text-white text-xl font-medium mb-1 items-center">
                    {f}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-4 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="/p-19.jpg"
                alt="Game Showcase"
                className="w-full h-100 lg:w-125 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
