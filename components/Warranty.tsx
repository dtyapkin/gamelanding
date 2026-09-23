export default function Warranty() {
  return (
    <section className="bg-gray-950 py-19 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight tracking-tight">
            Ты получаешь -<br />
            <span className="relative inline-block">
              <span className="text-purple-400">3 гарантии</span>
            </span>
          </h2>
        </div>

        {[
          {
            num: "1.",
            title: "Гарантия возврата",
            desc: "Если по итогу просмотра первого модуля ты понимаешь, что продукт тебе не подходит, мы возвращаем 100% денег, за вычетом банковской комиссии.",
          },
          {
            num: "2.",
            title: "Гарантия поддержки",
            desc: "Если твой куратор тебе плохо отвечает или не может помочь, ты пишешь в поддержку и мы в течение недели меняем тебе куратора на подходящего именно тебе.",
          },
          {
            num: "3.",
            title: "Гарантия результата",
            desc: "Если ты просмотрел все модули, выполнил все домашние задания и не сделал существенный для себя результат, мы отправим тебя в «исправительную группу» — это дополнительные 1,5 месяца работы с куратором за наш счёт.",
          },
        ].map((g, i) => (
          <div
            key={i}
            className="group bg-gray-900 rounded-3xl sm:rounded-[2rem] p-6 sm:p-8 lg:p-10 border border-gray-800 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/5"
          >
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl sm:text-5xl font-bold text-cyan-400">
                    {g.num}
                  </span>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                    {g.title}
                  </h3>
                </div>
                <p
                  className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-2xl"
                  dangerouslySetInnerHTML={{
                    __html: g.desc.replace(
                      /(100% денег|1,5 месяца работы с куратором)/g,
                      '<span class="text-white font-semibold">$1</span>',
                    ),
                  }}
                />
              </div>
              <div className="w-full lg:w-auto flex justify-center lg:justify-end">
                <div className="relative w-full max-w-[280px] aspect-square sm:aspect-[4/3] bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-cyan-500/20 flex items-center justify-center">
                  <div className="text-6xl sm:text-8xl font-bold text-cyan-400/20">
                    {i + 1}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
