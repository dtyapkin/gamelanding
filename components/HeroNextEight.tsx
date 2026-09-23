export default function HeroNextEight() {
  return (
    <section
      id="how-it-works"
      className="relative bg-slate-950 py-20 lg:py-28 overflow-hidden"
    >
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[150px]" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="relative flex justify-center lg:justify-start">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] lg:w-[500px] lg:h-[500px] bg-accent-purple/30 rounded-full" />
            <img
              src="/p-18.jpg"
              alt="Game Showcase"
              className="w-full object-center rounded-2xl"
            />
            {/* <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-[60%] z-0">
              <div className="w-56 h-36 lg:w-64 lg:h-40 bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl transform -rotate-12 border border-white/10 p-5">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-8 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded" />
                  <span className="text-white/80 text-xs font-bold">iZ</span>
                </div>
                <div className="text-white text-sm lg:text-base tracking-widest font-mono">
                  1234 5678 9101 1121
                </div>
              </div>
            </div> */}

            {/* <div className="relative z-20 w-64 lg:w-72">
              <div className="bg-[#1a1a1a] rounded-[3rem] p-3 shadow-2xl border border-white/10">
                <div className="bg-gradient-to-b from-gray-900 to-black rounded-[2.5rem] overflow-hidden">
                  <div className="flex justify-between items-center px-6 py-3 text-white text-xs">
                    <span>9:41</span>
                    <div className="w-4 h-4 bg-white/20 rounded-full" />
                  </div>
                  <div className="px-6 py-2">
                    <div className="text-white/70 text-xs mb-4">Cards</div>
                    <div className="text-white font-semibold mb-4">
                      My Cards
                    </div>
                  </div>
                  <div className="mx-6 mb-6 p-5 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl shadow-xl">
                    <div className="flex justify-between items-start mb-6">
                      <div className="text-white font-bold text-lg">iZ PAY</div>
                      <svg className="w-10 h-6" viewBox="0 0 48 48" fill="none">
                        <circle
                          cx="20"
                          cy="24"
                          r="16"
                          fill="#EB001B"
                          fillOpacity="0.8"
                        />
                        <circle
                          cx="28"
                          cy="24"
                          r="16"
                          fill="#F79E1B"
                          fillOpacity="0.8"
                        />
                      </svg>
                    </div>
                    <div className="text-white text-sm tracking-wider mb-4">
                      5234 5678 9101 2345
                    </div>
                    <div className="flex justify-between text-white/80 text-xs">
                      <span>Valid Thru</span>
                      <span>12/27</span>
                    </div>
                  </div>
                </div>
              </div>
            </div> */}
          </div>

          <div className="space-y-8">
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight">
              Как работает{" "}
              <span className="text-purple-500">игровая витрина</span>
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed max-w-lg">
              Простая цепочка для заработка.
            </p>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-accent-purple/20 flex items-center justify-center shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-1-circle w-7 h-7 text-accent-purple"
                    viewBox="0 0 16 16"
                  >
                    <path d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8Zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0ZM9.283 4.002V12H7.971V5.338h-.065L6.072 6.656V5.385l1.899-1.383h1.312Z"></path>
                  </svg>
                </div>
                <div className="items-end justify-end place-items-center">
                  <h3 className="text-accent-purple font-semibold items-center justify-center text-lg mb-1">
                    Вы получаете сайт
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Готовое решение «под ключ» с уникальным дизайном и
                    адаптивной вёрсткой.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-accent-purple/20 flex items-center justify-center shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-1-circle w-7 h-7 text-accent-purple"
                    viewBox="0 0 16 16"
                  >
                    <path d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8Zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0ZM6.646 6.24v.07H5.375v-.064c0-1.213.879-2.402 2.637-2.402 1.582 0 2.613.949 2.613 2.215 0 1.002-.6 1.667-1.287 2.43l-.096.107-1.974 2.22v.077h3.498V12H5.422v-.832l2.97-3.293c.434-.475.903-1.008.903-1.705 0-.744-.557-1.236-1.313-1.236-.843 0-1.336.615-1.336 1.306Z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-accent-purple font-semibold text-lg mb-1">
                    Готовый каталог игр
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Более 500 популярных игр, отсортированных по жанрам и
                    рейтингу.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-accent-purple/20 flex items-center justify-center shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-1-circle w-7 h-7 text-accent-purple"
                    viewBox="0 0 16 16"
                  >
                    <path d="M7.918 8.414h-.879V7.342h.838c.78 0 1.348-.522 1.342-1.237 0-.709-.563-1.195-1.348-1.195-.79 0-1.312.498-1.348 1.055H5.275c.036-1.137.95-2.115 2.625-2.121 1.594-.012 2.608.885 2.637 2.062.023 1.137-.885 1.776-1.482 1.875v.07c.703.07 1.71.64 1.734 1.917.024 1.459-1.277 2.396-2.93 2.396-1.705 0-2.707-.967-2.754-2.144H6.33c.059.597.68 1.06 1.541 1.066.973.006 1.6-.563 1.588-1.354-.006-.779-.621-1.318-1.541-1.318Z"></path>
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0ZM1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8Z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-accent-purple font-semibold text-lg mb-1">
                    Пользователь выбирает игру
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Удобные фильтры и поиск помогут найти игру за секунду.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-accent-purple/20 flex items-center justify-center shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-1-circle w-7 h-7 text-accent-purple"
                    viewBox="0 0 16 16"
                  >
                    <path d="M7.519 5.057c.22-.352.439-.703.657-1.055h1.933v5.332h1.008v1.107H10.11V12H8.85v-1.559H4.978V9.322c.77-1.427 1.656-2.847 2.542-4.265ZM6.225 9.281v.053H8.85V5.063h-.065c-.867 1.33-1.787 2.806-2.56 4.218Z"></path>
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0ZM1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8Z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-accent-purple font-semibold text-lg mb-1">
                    Нажимает «Играть»
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Мгновенный запуск без регистрации, скачивания и лишних
                    действий.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-accent-purple/20 flex items-center justify-center shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-1-circle w-7 h-7 text-accent-purple"
                    viewBox="0 0 16 16"
                  >
                    <path d="M1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8Zm15 0A8 8 0 1 0 0 8a8 8 0 0 0 16 0Zm-8.006 4.158c-1.57 0-2.654-.902-2.719-2.115h1.237c.14.72.832 1.031 1.529 1.031.791 0 1.57-.597 1.57-1.681 0-.967-.732-1.57-1.582-1.57-.767 0-1.242.45-1.435.808H5.445L5.791 4h4.705v1.103H6.875l-.193 2.343h.064c.17-.258.715-.68 1.611-.68 1.383 0 2.561.944 2.561 2.585 0 1.687-1.184 2.806-2.924 2.806Z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-accent-purple font-semibold text-lg mb-1">
                    Переходит в Яндекс Игры
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Полная интеграция с платформой — доступ к тысячам игр без
                    ограничений.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-accent-purple/20 flex items-center justify-center shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-1-circle w-7 h-7 text-accent-purple"
                    viewBox="0 0 16 16"
                  >
                    <path d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8Zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0ZM8.21 3.855c1.612 0 2.515.99 2.573 1.899H9.494c-.1-.358-.51-.815-1.312-.815-1.078 0-1.817 1.09-1.805 3.036h.082c.229-.545.855-1.155 1.98-1.155 1.254 0 2.508.88 2.508 2.555 0 1.77-1.218 2.783-2.847 2.783-.932 0-1.84-.328-2.409-1.254-.369-.603-.597-1.459-.597-2.642 0-3.012 1.248-4.407 3.117-4.407Zm-.099 4.008c-.92 0-1.564.65-1.564 1.576 0 1.032.703 1.635 1.558 1.635.868 0 1.553-.533 1.553-1.629 0-1.06-.744-1.582-1.547-1.582Z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-accent-purple font-semibold text-lg mb-1">
                    Вы зарабатываете на рекламе
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Создайте свой источник дополнительного дохода на рекламе
                  </p>
                </div>
              </div>
            </div>

            {/* <div className="space-y-6">
              {[
                {
                  title: "Вы получаете сайт",
                  desc: "Готовое решение «под ключ» с уникальным дизайном и адаптивной вёрсткой.",
                },
                {
                  title: "Готовый каталог игр",
                  desc: "Более 500 популярных игр, отсортированных по жанрам и рейтингу.",
                },
                {
                  title: "Переход в игру",
                  desc: "Пользователь нажимает на карточку и переходит к игре на Яндекс Играх.",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-accent-purple/20 flex items-center justify-center shrink-0">
                    <svg
                      className="w-7 h-7 text-accent-purple"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8Zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0ZM9.283 4.002V12H7.971V5.338h-.065L6.072 6.656V5.385l1.899-1.383h1.312Z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-accent-purple font-semibold text-lg mb-1">
                      {item.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div> */}
          </div>
        </div>
      </div>
    </section>
  );
}
