export default function HeroNextTwentyOneNew() {
  return (
    <section className="relative bg-slate-950 py-20 lg:py-28 overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px]" />
      <div className="relative max-w-4xl mx-auto px-6 lg:px-12 text-center">
        <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight tracking-tight mb-6">
          Начните зарабатывать <br />
          <span className="text-purple-400">уже сегодня</span>
        </h2>
        <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto mb-10">
          Не откладывайте запуск своего проекта. Получите готовую игровую
          витрину и начните привлекать первую аудиторию.
        </p>
        <a
          href="#pricing"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-xl text-white bg-purple-500 shadow-lg shadow-purple-500/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/50 transition-all"
        >
          Выбрать тариф →
        </a>
      </div>
    </section>
  );
}
