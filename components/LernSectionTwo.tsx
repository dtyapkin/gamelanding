export default function LearnSectionTwo() {
  const cards = [
    {
      title: "Большой объём аудитории",
      desc: "Игровой контент понятен пользователям практически любого возраста.",
      badge: "1 МЛН₽",
      image: "/f-6.jpg",
    },
    {
      title: "Новые игры постоянно",
      desc: "Каталог можно регулярно обновлять и расширять.",
      badge: null,
      image: "/f-7.jpg",
    },

    {
      title: "Взаимодействие с сайтом",
      desc: "Это не обычная информационная страница, которую человек быстро закрывает.",
      badge: "ЗАБЕРИ МОИ ДЕНЬГИ УЖЕ",
      image: "/f-8.jpg",
    },
    {
      title: "Развитие проекта",
      desc: "Начать с небольшой витрины, а затем добавлять категории, SEO-страницы, контент и рекламные места.",
      badge: null,
      image: "/f-9.jpg",
    },
  ];

  return (
    <section className="bg-gray-950 py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Почему именно
            <span className="text-purple-400"> игры и реклама?</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {cards.map((card, i) => (
            <div
              key={i}
              className="group bg-gray-900 rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-800 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10"
            >
              <div className="aspect-[4/3] bg-gray-800 relative overflow-hidden flex ">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20" />
                <img
                  src={card.image}
                  alt="Entrepreneur"
                  className="relative  h-5xl w-5xl content-center object-cover object-top mix-blend-normal"
                />
                {/* {card.badge && (
                  <div
                    className={`absolute top-3 ${card.badge.includes("ДЕНЬГИ") ? "left-3 bg-gray-900/90 border border-gray-700" : "right-3 bg-indigo-500"} text-white text-xs font-bold px-2 py-1 rounded`}
                  >
                    {card.badge}
                  </div>
                )} */}
              </div>
              <div className="p-5 sm:p-6">
                <h3 className="text-xl sm:text-2xl font-normal text-white mb-3">
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
