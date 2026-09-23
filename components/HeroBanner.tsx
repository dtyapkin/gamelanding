export default function HeroBanner() {
  return (
    <section className="relative bg-slate-950 py-10 lg:py-18 overflow-hidden pt-10 pb-10 lg:pt-10 lg:pb-10">
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[150px]" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
        <h2 className="section-title text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight tracking-tight justify mb-4">
          Простая игровая витрина, <br />
          <span className="text-purple-400">которую хочется открывать</span>
        </h2>
        <p className="section-subtitle mb-16">Что видит посетитель</p>

        <div className="grid lg:grid-cols-1 gap-10 lg:gap-10 items-center">
          <div className="flex items-center justify-center z-10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl backdrop-blur-sm border border-white/10">
            <img
              src="/p-1.jpg"
              alt="Game Showcase Preview"
              className="w-full object-cover rounded-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
