export default function HeroNextThirteen() {
  return (
    <section className="relative bg-slate-950 py-10 lg:py-18 overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[150px]" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <div className="lg:col-span-3 space-y-6">
            <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
              Почему именно игры?
            </h2>
          </div>

          <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {[
              {
                icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
                color: "purple",
                title: "Большой объём аудитории",
                desc: "Игровой контент понятен пользователям практически любого возраста.",
              },
              {
                icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
                color: "orange",
                title: "Новые игры постоянно",
                desc: "Каталог можно регулярно обновлять и расширять.",
              },
              {
                icon: "M13 10V3L4 14h7v7l9-11h-7z",
                color: "emerald",
                title: "Взаимодействие с сайтом",
                desc: "Это не обычная информационная страница, которую человек быстро закрывает.",
              },
              {
                icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
                color: "blue",
                title: "Развитие проекта",
                desc: "Начать с небольшой витрины, а затем добавлять категории, SEO-страницы, контент и рекламные места.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`group bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-800 hover:border-${item.color}-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-${item.color}-500/10 hover:-translate-y-1`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-${item.color}-500/15 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
                >
                  <svg
                    className={`w-7 h-7 text-${item.color}-400`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d={item.icon}
                    />
                  </svg>
                </div>
                <h3 className="text-white font-bold text-base mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
