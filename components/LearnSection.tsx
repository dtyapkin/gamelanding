export default function LearnSection() {
  const cards = [
    {
      title: "Управление и администрирование портала",
      desc: "Как легко работать с админ-панелью, добавлять новые игры, управлять категориями, а также поддерживать техническую стабильность",
      badge: "1 МЛН₽",
    },
    {
      title: "SEO-продвижение и создание вирального контента",
      desc: "Как правильно описывать игры для попадания в ТОП Яндекса",
      badge: null,
    },
    {
      title: "Привлечение целевого трафика",
      desc: "Откуда брать игроков: использовать виральные механики для быстрого роста аудитории.",
      badge: null,
    },
    {
      title: "Монетизация и работа с рекламодателями",
      desc: "Как подключить и грамотно разместить рекламные сети, работать с CPA-офферами, продавать прямые интеграции.",
      badge: "ЗАБЕРИ МОИ ДЕНЬГИ УЖЕ",
    },
    {
      title: "Веб-аналитика и оптимизация показателей",
      desc: "Настройка Яндекс.Метрики, анализ поведения игроков, отслеживание кликов по рекламе.",
      badge: null,
    },
    {
      title: "Масштабирование и автоматизация бизнеса",
      desc: "Как превратить один сайт в сеть игровых порталов, выстроить систему пассивного дохода и сделать проект полноценным цифровым активом",
      badge: null,
    },
  ];

  return (
    <section className="bg-gray-950 py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Чему ты <span className="text-indigo-400">научишься</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {cards.map((card, i) => (
            <div
              key={i}
              className="group bg-gray-900 rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-800 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10"
            >
              <div className="aspect-[4/3] bg-gray-800 relative overflow-hidden flex items-center justify-center p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20" />
                {card.badge && (
                  <div
                    className={`absolute top-3 ${card.badge.includes("ДЕНЬГИ") ? "left-3 bg-gray-900/90 border border-gray-700" : "right-3 bg-indigo-500"} text-white text-xs font-bold px-2 py-1 rounded`}
                  >
                    {card.badge}
                  </div>
                )}
              </div>
              <div className="p-5 sm:p-6">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                  {card.title}
                </h3>
                <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                  {card.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
