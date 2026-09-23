export default function WhatIncludedNew() {
  const items = [
    "Архив с исходным кодом сайта",
    "Готовую структуру каталога игр",
    "Карточки игр с описаниями",
    "Настроенные переходы к играм",
    "Адаптивную версию для мобильных",
    "Места для размещения рекламы",
    "Подробную инструкцию по установке",
    "Рекомендации по развитию и SEO",
  ];

  return (
    <section className="relative bg-slate-950 py-20 lg:py-28 overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[150px]" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight">
              Что входит в покупку
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed max-w-lg">
              После оплаты вы получаете:
            </p>

            <div className="space-y-4">
              {items.map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-accent-purple/20 flex items-center justify-center shrink-0">
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
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-1">
                      {item}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl backdrop-blur-sm border border-white/10 p-8">
              <img
                src="/p-1.jpg"
                alt="Included"
                className="w-full object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
