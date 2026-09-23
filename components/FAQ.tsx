export default function FAQ() {
  const faqs = [
    {
      q: "Нужно ли уметь программировать?",
      a: "Специальные знания не требуются. Установка простая и интуитивно понятная.",
    },
    {
      q: "Можно ли размещать рекламу?",
      a: "Да, сайт предусматривает рекламные места. Конкретные возможности зависят от требований рекламной системы.",
    },
    {
      q: "Игры находятся на моём сайте?",
      a: "Нет. Витрина показывает карточки игр, а пользователь переходит к игре через соответствующую ссылку.",
    },
    {
      q: "Можно ли добавлять новые игры?",
      a: "Да, если ваша система это позволяет.",
    },
    {
      q: "Можно ли изменить дизайн?",
      a: "Опишите реальные возможности в зависимости от вашего тарифа.",
    },
    {
      q: "А сколько можно заработать?",
      a: "Фиксированную сумму обещать нельзя. Доход зависит от количества посетителей, их географии, рекламных форматов, CTR и других факторов.",
    },
    {
      q: "Что я получаю после оплаты?",
      a: "Файлы сайта, готовую структуру, каталог игр, карточки, настроенные переходы, адаптивную версию, рекламные места, инструкции и рекомендации по развитию.",
    },
  ];

  return (
    <section id="faq" className="py-20 lg:py-32 bg-bg-secondary">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="flex justify-center text-4xl lg:text-5xl xl:text-6xl font-bold mb-16">
          Частые<span className="text-accent-purple ml-6">вопросы</span>
        </h2>
        <div className="space-y-4">
          {faqs.map((f, i) => (
            <details key={i} className="glass-card group">
              <summary className="p-6 cursor-pointer list-none flex items-center justify-between font-semibold text-lg hover:bg-accent-primary/5 transition-colors">
                {f.q}
                <span className="text-accent-purple text-2xl transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="px-6 pb-6 text-gray-400 leading-relaxed">
                {f.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
