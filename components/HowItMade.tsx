export default function HowItMade() {
  return (
    <section className="bg-gray-950 py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Как это <span className="text-cyan-400">сделано</span>
          </h2>
        </div>

        {[
          {
            num: "1.",
            title: "Получаете готовые файлы сайта",
            points: [
              "Архив с исходным кодом игровой витрины",
              "Инструкция по установке за 15 минут",
              "Доступ к каталогу из 500+ игр",
              "Настроенные переходы к играм",
              "Адаптивная вёрстка под все устройства",
              "Места для интеграции рекламных сетей",
            ],
            result:
              "Сайт готов к установке, все файлы структурированы и проверены",
            color: "cyan",
            images: ["/p-10.jpg", "/p-11.jpg", "/p-12.jpg", "/p-13.jpg"],
          },
          {
            num: "2.",
            title: "Настраиваете под себя",
            points: [
              "Меняете логотип, названия и тексты",
              "Добавляете или удаляете игры из каталога",
              "Настраиваете мета-теги для SEO",
              "Подключаете аналитику (Яндекс.Метрика)",
              "Размещаете рекламные блоки в предусмотренных местах",
              "Проверяете корректность переходов",
            ],
            result: "Сайт полностью персонализирован и готов к публикации",
            color: "cyan",
            images: ["/p-10.jpg", "/p-11.jpg", "/p-12.jpg", "/p-13.jpg"], // Замените на реальные пути из вашего Astro проекта
          },
          {
            num: "3.",
            title: "Выложить в интернет и зарабатывать",
            points: [
              "Выкладываем витрину в интернет на хостинг",
              "Настраиваем SEO-продвижение для бесплатного трафика из поиска",
              "Изучаем 32 рабочих способа привлечения посетителей",
              "Составляем контент-план для набора первых 10 000 посетителей",
              "Разбираем воронку через поисковые системы на 100 000 ₽",
              "Масштабируем успешную витрину до 300 000 ₽ в месяц",
            ],
            result:
              "Нашёл первого рекламодателя, получил первый доход и выстроил систему, которая работает каждый день с предсказуемым результатом",
            color: "cyan",
            images: ["/p-15.jpg", "/p-16.jpg", "/p-17.jpg", "/p-14.jpg"],
          },
        ].map((module, i) => (
          <div
            key={i}
            className="bg-gray-900 rounded-3xl sm:rounded-[2rem] p-6 sm:p-8 lg:p-10 border border-gray-800"
          >
            <div className="flex items-start gap-3 mb-6">
              <span
                className={`text-3xl sm:text-4xl font-bold text-${module.color}-400 shrink-0`}
              >
                {module.num}
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                {module.title}
              </h2>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 mb-8">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                <ul className="space-y-3">
                  {module.points.slice(0, 3).map((p, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span
                        className={`mt-1.5 w-2 h-2 bg-${module.color}-400 rounded-full shrink-0`}
                      />
                      <span className="text-gray-300 text-base sm:text-lg leading-relaxed">
                        {p}
                      </span>
                    </li>
                  ))}
                </ul>
                <ul className="space-y-3">
                  {module.points.slice(3).map((p, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span
                        className={`mt-1.5 w-2 h-2 bg-${module.color}-400 rounded-full shrink-0`}
                      />
                      <span className="text-gray-300 text-base sm:text-lg leading-relaxed">
                        {p}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="lg:w-80 shrink-0">
                <div
                  className={`bg-${module.color}-500/10 border border-${module.color}-500/20 rounded-2xl p-5 sm:p-6`}
                >
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                    Результат:
                  </h3>
                  <p
                    className="text-gray-300 text-base sm:text-lg leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: module.result.replace(
                        /(первого рекламодателя|систему)/g,
                        '<span class="text-white font-semibold">$1</span>',
                      ),
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {module.images.map((img, idx) => (
                <div
                  key={idx}
                  className="bg-gray-800 rounded-xl overflow-hidden aspect-[16/10] border border-gray-700"
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
