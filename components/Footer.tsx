export default function Footer() {
  return (
    <footer className="bg-bg-secondary border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 text-2xl font-bold mb-4">
              <span>🎮</span>
              <span>Game Online</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Игровая витрина для создания и развития собственного проекта.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Разделы</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a
                  href="#income"
                  className="hover:text-accent-purple transition-colors"
                >
                  Возможности
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="hover:text-accent-purple transition-colors"
                >
                  Тарифы
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="hover:text-accent-purple transition-colors"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Контакты</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a
                  href="#"
                  className="hover:text-accent-purple transition-colors"
                >
                  Email: shop:gamedive.ru
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-accent-purple transition-colors"
                >
                  Telegram: @gamedive
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Документы</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a
                  href="/legal/privacy"
                  className="hover:text-accent-purple transition-colors"
                >
                  Политика конфиденциальности
                </a>
              </li>
              <li>
                <a
                  href="/legal/offer"
                  className="hover:text-accent-purple transition-colors"
                >
                  Пользовательское соглашение
                </a>
              </li>
              <li>
                <a
                  href="/legal/terms"
                  className="hover:text-accent-purple transition-colors"
                >
                  Условия использования
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-border text-center text-sm text-gray-500">
          © {new Date().getFullYear()} ИП Тяпкин Игорь Григорьевич ОГРНИП
          318774600288541 ИНН 263511438202 Все права защищены.
        </div>
      </div>
    </footer>
  );
}
