export default function PricingComparison() {
  return (
    <section className="bg-[#0a0e27] py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Сравнение<span className="text-[#8b5cf6]">тарифов</span>
          </h2>
        </div>

        {/* Таблица сравнения */}
        <div className="overflow-x-auto rounded-2xl border border-[#1e2a5a]">
          <table className="w-full min-w-[600px]">
            {/* Шапка таблицы */}
            <thead>
              <tr className="bg-[#0f1535] border-b border-[#1e2a5a]">
                <th className="text-left p-4 sm:p-5 text-lg sm:text-xl font-bold text-white w-[40%]">
                  Возможность
                </th>
                <th className="text-center p-4 sm:p-5 text-lg sm:text-xl font-bold text-white w-[20%]">
                  START
                </th>
                <th className="text-center p-4 sm:p-5 text-lg sm:text-xl font-bold text-[#8b5cf6] w-[20%] bg-[#8b5cf6]/5">
                  PRO
                </th>
                <th className="text-center p-4 sm:p-5 text-lg sm:text-xl font-bold text-white w-[20%]">
                  ULTIMATE
                </th>
              </tr>
            </thead>

            {/* Тело таблицы */}
            <tbody className="divide-y divide-[#1e2a5a]">
              {/* Игровая витрина */}
              <tr className="bg-[#0a0e27] hover:bg-[#0f1535]/50 transition-colors">
                <td className="p-4 sm:p-5 text-gray-300 text-sm sm:text-base">
                  Игровая витрина
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <CheckIcon className="text-white" />
                </td>
                <td className="p-4 sm:p-5 text-center bg-[#8b5cf6]/5">
                  <CheckIcon className="text-[#8b5cf6]" />
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <CheckIcon className="text-white" />
                </td>
              </tr>

              {/* Каталог игр */}
              <tr className="bg-[#0f1535] hover:bg-[#0f1535]/70 transition-colors">
                <td className="p-4 sm:p-5 text-gray-300 text-sm sm:text-base">
                  Каталог игр
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <CheckIcon className="text-white" />
                </td>
                <td className="p-4 sm:p-5 text-center bg-[#8b5cf6]/5">
                  <CheckIcon className="text-[#8b5cf6]" />
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <CheckIcon className="text-white" />
                </td>
              </tr>

              {/* Карточки игр */}
              <tr className="bg-[#0a0e27] hover:bg-[#0f1535]/50 transition-colors">
                <td className="p-4 sm:p-5 text-gray-300 text-sm sm:text-base">
                  Карточки игр
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <CheckIcon className="text-white" />
                </td>
                <td className="p-4 sm:p-5 text-center bg-[#8b5cf6]/5">
                  <CheckIcon className="text-[#8b5cf6]" />
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <CheckIcon className="text-white" />
                </td>
              </tr>

              {/* Переход к играм */}
              <tr className="bg-[#0f1535] hover:bg-[#0f1535]/70 transition-colors">
                <td className="p-4 sm:p-5 text-gray-300 text-sm sm:text-base">
                  Переход к играм
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <CheckIcon className="text-white" />
                </td>
                <td className="p-4 sm:p-5 text-center bg-[#8b5cf6]/5">
                  <CheckIcon className="text-[#8b5cf6]" />
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <CheckIcon className="text-white" />
                </td>
              </tr>

              {/* Адаптивная версия */}
              <tr className="bg-[#0a0e27] hover:bg-[#0f1535]/50 transition-colors">
                <td className="p-4 sm:p-5 text-gray-300 text-sm sm:text-base">
                  Адаптивная версия
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <CheckIcon className="text-white" />
                </td>
                <td className="p-4 sm:p-5 text-center bg-[#8b5cf6]/5">
                  <CheckIcon className="text-[#8b5cf6]" />
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <CheckIcon className="text-white" />
                </td>
              </tr>

              {/* Рекламные места */}
              <tr className="bg-[#0f1535] hover:bg-[#0f1535]/70 transition-colors">
                <td className="p-4 sm:p-5 text-gray-300 text-sm sm:text-base">
                  Рекламные места
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <CheckIcon className="text-white" />
                </td>
                <td className="p-4 sm:p-5 text-center bg-[#8b5cf6]/5">
                  <CheckIcon className="text-[#8b5cf6]" />
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <CheckIcon className="text-white" />
                </td>
              </tr>

              {/* Базовая настройка */}
              <tr className="bg-[#0a0e27] hover:bg-[#0f1535]/50 transition-colors">
                <td className="p-4 sm:p-5 text-gray-300 text-sm sm:text-base">
                  Базовая настройка
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <CheckIcon className="text-white" />
                </td>
                <td className="p-4 sm:p-5 text-center bg-[#8b5cf6]/5">
                  <CheckIcon className="text-[#8b5cf6]" />
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <CheckIcon className="text-white" />
                </td>
              </tr>

              {/* Расширенные настройки */}
              <tr className="bg-[#0f1535] hover:bg-[#0f1535]/70 transition-colors">
                <td className="p-4 sm:p-5 text-gray-300 text-sm sm:text-base">
                  Расширенные настройки
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <DashIcon />
                </td>
                <td className="p-4 sm:p-5 text-center bg-[#8b5cf6]/5">
                  <CheckIcon className="text-[#8b5cf6]" />
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <CheckIcon className="text-white" />
                </td>
              </tr>

              {/* Больше рекламных блоков */}
              <tr className="bg-[#0a0e27] hover:bg-[#0f1535]/50 transition-colors">
                <td className="p-4 sm:p-5 text-gray-300 text-sm sm:text-base">
                  Больше рекламных блоков
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <DashIcon />
                </td>
                <td className="p-4 sm:p-5 text-center bg-[#8b5cf6]/5">
                  <CheckIcon className="text-[#8b5cf6]" />
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <CheckIcon className="text-white" />
                </td>
              </tr>

              {/* Дополнительное оформление */}
              <tr className="bg-[#0f1535] hover:bg-[#0f1535]/70 transition-colors">
                <td className="p-4 sm:p-5 text-gray-300 text-sm sm:text-base">
                  Дополнительное оформление
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <DashIcon />
                </td>
                <td className="p-4 sm:p-5 text-center bg-[#8b5cf6]/5">
                  <CheckIcon className="text-[#8b5cf6]" />
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <CheckIcon className="text-white" />
                </td>
              </tr>

              {/* Расширенная структура каталога */}
              <tr className="bg-[#0a0e27] hover:bg-[#0f1535]/50 transition-colors">
                <td className="p-4 sm:p-5 text-gray-300 text-sm sm:text-base">
                  Расширенная структура каталога
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <DashIcon />
                </td>
                <td className="p-4 sm:p-5 text-center bg-[#8b5cf6]/5">
                  <CheckIcon className="text-[#8b5cf6]" />
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <CheckIcon className="text-white" />
                </td>
              </tr>

              {/* Дополнительные настройки SEO */}
              <tr className="bg-[#0f1535] hover:bg-[#0f1535]/70 transition-colors">
                <td className="p-4 sm:p-5 text-gray-300 text-sm sm:text-base">
                  Дополнительные настройки SEO
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <DashIcon />
                </td>
                <td className="p-4 sm:p-5 text-center bg-[#8b5cf6]/5">
                  <CheckIcon className="text-[#8b5cf6]" />
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <CheckIcon className="text-white" />
                </td>
              </tr>

              {/* Возможность масштабирования */}
              <tr className="bg-[#0a0e27] hover:bg-[#0f1535]/50 transition-colors">
                <td className="p-4 sm:p-5 text-gray-300 text-sm sm:text-base">
                  Возможность масштабирования
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <DashIcon />
                </td>
                <td className="p-4 sm:p-5 text-center bg-[#8b5cf6]/5">
                  <CheckIcon className="text-[#8b5cf6]" />
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <CheckIcon className="text-white" />
                </td>
              </tr>

              {/* 3 дополнительных премиум-шаблона */}
              <tr className="bg-[#0f1535] hover:bg-[#0f1535]/70 transition-colors">
                <td className="p-4 sm:p-5 text-gray-300 text-sm sm:text-base">
                  3 дополнительных премиум-шаблона
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <DashIcon />
                </td>
                <td className="p-4 sm:p-5 text-center bg-[#8b5cf6]/5">
                  <DashIcon />
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <CheckIcon className="text-white" />
                </td>
              </tr>

              {/* Полное развертывание «под ключ» */}
              <tr className="bg-[#0a0e27] hover:bg-[#0f1535]/50 transition-colors">
                <td className="p-4 sm:p-5 text-gray-300 text-sm sm:text-base">
                  Полное развертывание «под ключ»
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <DashIcon />
                </td>
                <td className="p-4 sm:p-5 text-center bg-[#8b5cf6]/5">
                  <DashIcon />
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <CheckIcon className="text-white" />
                </td>
              </tr>

              {/* Настройка домена и SSL-сертификата */}
              <tr className="bg-[#0f1535] hover:bg-[#0f1535]/70 transition-colors">
                <td className="p-4 sm:p-5 text-gray-300 text-sm sm:text-base">
                  Настройка домена и SSL-сертификата
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <DashIcon />
                </td>
                <td className="p-4 sm:p-5 text-center bg-[#8b5cf6]/5">
                  <DashIcon />
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <CheckIcon className="text-white" />
                </td>
              </tr>

              {/* Настройка автоматических бэкапов */}
              <tr className="bg-[#0a0e27] hover:bg-[#0f1535]/50 transition-colors">
                <td className="p-4 sm:p-5 text-gray-300 text-sm sm:text-base">
                  Настройка автоматических бэкапов
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <DashIcon />
                </td>
                <td className="p-4 sm:p-5 text-center bg-[#8b5cf6]/5">
                  <DashIcon />
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <CheckIcon className="text-white" />
                </td>
              </tr>

              {/* Техническая оптимизация скорости */}
              <tr className="bg-[#0f1535] hover:bg-[#0f1535]/70 transition-colors">
                <td className="p-4 sm:p-5 text-gray-300 text-sm sm:text-base">
                  Техническая оптимизация скорости
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <DashIcon />
                </td>
                <td className="p-4 sm:p-5 text-center bg-[#8b5cf6]/5">
                  <DashIcon />
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <CheckIcon className="text-white" />
                </td>
              </tr>

              {/* Помощь в интеграции рекламных сетей */}
              <tr className="bg-[#0a0e27] hover:bg-[#0f1535]/50 transition-colors">
                <td className="p-4 sm:p-5 text-gray-300 text-sm sm:text-base">
                  Помощь в интеграции рекламных сетей
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <DashIcon />
                </td>
                <td className="p-4 sm:p-5 text-center bg-[#8b5cf6]/5">
                  <DashIcon />
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <CheckIcon className="text-white" />
                </td>
              </tr>

              {/* Первичное наполнение каталога */}
              <tr className="bg-[#0f1535] hover:bg-[#0f1535]/70 transition-colors">
                <td className="p-4 sm:p-5 text-gray-300 text-sm sm:text-base">
                  Первичное наполнение каталога
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <DashIcon />
                </td>
                <td className="p-4 sm:p-5 text-center bg-[#8b5cf6]/5">
                  <DashIcon />
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <CheckIcon className="text-white" />
                </td>
              </tr>

              {/* Продвинутое SEO */}
              <tr className="bg-[#0a0e27] hover:bg-[#0f1535]/50 transition-colors">
                <td className="p-4 sm:p-5 text-gray-300 text-sm sm:text-base">
                  Продвинутое SEO
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <DashIcon />
                </td>
                <td className="p-4 sm:p-5 text-center bg-[#8b5cf6]/5">
                  <DashIcon />
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <CheckIcon className="text-white" />
                </td>
              </tr>

              {/* Приоритетная техническая поддержка */}
              <tr className="bg-[#0f1535] hover:bg-[#0f1535]/70 transition-colors">
                <td className="p-4 sm:p-5 text-gray-300 text-sm sm:text-base">
                  Приоритетная техническая поддержка
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <DashIcon />
                </td>
                <td className="p-4 sm:p-5 text-center bg-[#8b5cf6]/5">
                  <DashIcon />
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <CheckIcon className="text-white" />
                </td>
              </tr>

              {/* Бесплатные обновления */}
              <tr className="bg-[#0a0e27] hover:bg-[#0f1535]/50 transition-colors">
                <td className="p-4 sm:p-5 text-gray-300 text-sm sm:text-base">
                  Бесплатные обновления
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <DashIcon />
                </td>
                <td className="p-4 sm:p-5 text-center bg-[#8b5cf6]/5">
                  <DashIcon />
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <CheckIcon className="text-white" />
                </td>
              </tr>

              {/* Материалы по продвижению */}
              <tr className="bg-[#0f1535] hover:bg-[#0f1535]/70 transition-colors">
                <td className="p-4 sm:p-5 text-gray-300 text-sm sm:text-base">
                  Материалы по продвижению
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <DashIcon />
                </td>
                <td className="p-4 sm:p-5 text-center bg-[#8b5cf6]/5">
                  <DashIcon />
                </td>
                <td className="p-4 sm:p-5 text-center">
                  <CheckIcon className="text-white" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// Вспомогательный компонент — иконка галочки
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={`w-5 h-5 mx-auto ${className ?? ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

// Вспомогательный компонент — прочерк (отсутствие возможности)
function DashIcon() {
  return <span className="text-gray-500 text-xl">—</span>;
}
