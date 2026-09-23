const startFeatures = [
  "Готовую игровую витрину",
  "Каталог игр",
  "Карточки игр",
  "Переход пользователей к играм",
  "Адаптивную версию",
  "Базовую структуру сайта",
  "Рекламные места",
  "Инструкцию по запуску",
];
const proFeatures = [
  "Всё из START",
  "Расширенные настройки",
  "Больше рекламных блоков",
  "Дополнительное оформление",
  "Расширенная структура каталога",
  "Дополнительные настройки SEO",
  "Возможность масштабирования",
  "Подробная инструкция",
  "Дополнительные материалы",
];
const vipFeatures = [
  "Всё из тарифа PRO",
  "Полное развертывание «под ключ»",
  "Настройка домена и SSL-сертификата",
  "Настройка автоматических бэкапов",
  "Техническая оптимизация скорости",
  "Помощь в интеграции рекламных сетей",
  "Первичное наполнение каталога",
  "Продвинутое SEO",
  "Приоритетная техническая поддержка",
  "Бесплатные обновления",
  "Материалы по продвижению",
];

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="bg-slate-950 py-10 lg:py-22 bg-bg-primary overflow-hidden"
    >
      <div className="text-center mb-16">
        <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight tracking-tight">
          Выберите -<br />
          <span className="relative inline-block">
            <span className="text-purple-400">подходящий вариант</span>
          </span>
        </h2>
        <p className="section-subtitle mb-16 mt-8">
          Два тарифа — от простого старта до расширенных возможностей
        </p>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {/* START */}
          <div className="glass-card p-8 lg:p-10 hover:-translate-y-2 border-accent-purple/50 hover:border-accent-purple transition-all duration-300">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold mb-2">START</h3>
              <p className="text-gray-400">Для тех, кто хочет попробовать</p>
            </div>
            <div className="text-center mb-8 p-8 rounded-2xl border border-border">
              <span className="text-3xl font-bold align-top mr-1">₽</span>
              <span className="text-7xl font-bold text-purple-400">300</span>
            </div>
            <ul className="space-y-4 mb-8">
              {startFeatures.map((f, i) => (
                <li key={i} className="flex text-xl items-center gap-3">
                  <svg
                    className="w-5 h-5 text-purple-500 shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-300">{f}</span>
                </li>
              ))}
            </ul>
            <a
              href="#"
              className="block w-full text-center py-4 border-2 text-2xl bg-slate-800 border-accent-purple rounded-xl font-normal hover:border-purple-500 hover:bg-accent-purple/10 transition-all"
            >
              Купить START
            </a>
          </div>

          {/* PRO */}
          <div className="relative glass-card p-8 lg:p-10 border-2 border-purple-500 bg-gradient-card lg:scale-105 hover:-translate-y-2 transition-all duration-300">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent-purple px-6 py-2 rounded-full text-xl font-normal whitespace-nowrap">
              🔥 ПОПУЛЯРНЫЙ
            </div>
            <div className="text-center mb-8 mt-4">
              <h3 className="text-3xl font-bold mb-2">PRO</h3>
              <p className="text-gray-400">
                Для тех, кто хочет больше возможностей
              </p>
            </div>
            <div className="text-center mb-8 p-8 rounded-2xl border border-accent-purple/30">
              <span className="text-3xl font-bold align-top mr-1">₽</span>
              <span className="text-7xl font-bold text-purple-400">900</span>
            </div>
            <ul className="space-y-4 mb-8">
              {proFeatures.map((f, i) => (
                <li key={i} className="flex text-xl items-center gap-3">
                  <svg
                    className="w-5 h-5 text-purple-500 shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-300">{f}</span>
                </li>
              ))}
            </ul>
            <a
              href="#"
              className="block w-full text-center py-4 text-2xl bg-accent-purple text-white rounded-xl font-normal shadow-glow hover:shadow-glow-strong hover:-translate-y-0.5 transition-all"
            >
              Купить PRO
            </a>
          </div>

          {/* VIP */}
          <div className="glass-card p-8 lg:p-10 hover:-translate-y-2 border-accent-purple/50 hover:border-accent-purple transition-all duration-300">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold mb-2">Ultimate</h3>
              <p className="text-gray-400">
                Делаем всё за вас, чтобы сайт сразу начал приносить деньги
              </p>
            </div>
            <div className="text-center mb-8 p-8 rounded-2xl border border-border">
              <span className="text-3xl font-bold align-top mr-1">₽</span>
              <span className="text-7xl font-bold text-purple-400">1900</span>
            </div>
            <ul className="space-y-4 mb-8">
              {vipFeatures.map((f, i) => (
                <li key={i} className="flex text-xl items-center gap-3">
                  <svg
                    className="w-5 h-5 text-purple-500 shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-300">{f}</span>
                </li>
              ))}
            </ul>
            <a
              href="#"
              className="block w-full text-center py-4 border-2 text-2xl bg-slate-800 border-accent-purple rounded-xl font-normal hover:border-purple-500 hover:bg-accent-purple/10 transition-all"
            >
              Купить Ultimate
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
