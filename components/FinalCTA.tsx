export default function FinalCTA() {
  return (
    <section className="bg-slate-950 py-20 lg:py-32 bg-bg-primary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-10 lg:p-16 text-center border-2 border-accent-purple bg-gradient-card">
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-6">
            Запустите свою игровую витрину
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Получите готовую основу для игрового сайта и начните развивать
            собственную площадку.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-white bg-slate-800 border border-border hover:border-purple-500 hover:bg-accent-purple/10 transition-all"
            >
              Получить START — 300 ₽
            </a>
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-xl text-white bg-accent-purple shadow-lg shadow-accent-purple/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent-purple/50 transition-all"
            >
              Получить PRO — 900 ₽
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            <span className="flex items-center gap-2">✓ Оплата онлайн</span>
            <span className="flex items-center gap-2">
              ✓ Мгновенное получение
            </span>
            <span className="flex items-center gap-2">✓ Инструкция внутри</span>
          </div>
        </div>
      </div>
    </section>
  );
}
