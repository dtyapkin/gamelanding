"use client";

import { useState } from "react";

const navLinks = [
  { href: "#income", label: "Возможности" },
  { href: "#how-it-works", label: "Как работает" },
  { href: "#pricing", label: "Тарифы" },
  { href: "#faq", label: "FAQ" },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLinkClick = () => setIsMobileMenuOpen(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-bg-primary/95 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-20 gap-4">
          <a
            href="/"
            className="flex items-center gap-3 text-2xl font-bold shrink-0"
          >
            <span className="text-3xl">🎮</span>
            <span className="hidden sm:inline">Online Game</span>
          </a>

          <ul className="hidden lg:flex items-center gap-8 list-none m-0 p-0">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-gray-400 font-medium  hover:text-accent-purple transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden lg:block shrink-0">
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-white bg-accent-purple  text-sm"
            >
              Купить за 300 ₽
            </a>
          </div>

          <button
            aria-label="Открыть меню"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden relative w-10 h-10 flex items-center justify-center bg-transparent border-none cursor-pointer z-50"
          >
            <span
              className={`block w-6 h-0.5 bg-white transition-all relative ${isMobileMenuOpen ? "bg-transparent" : ""}`}
            >
              <span
                className={`absolute left-0 w-6 h-0.5 bg-white transition-all ${isMobileMenuOpen ? "top-0 rotate-45" : "-top-2"}`}
              ></span>
              <span
                className={`absolute left-0 w-6 h-0.5 bg-white transition-all ${isMobileMenuOpen ? "top-0 -rotate-45" : "top-2"}`}
              ></span>
            </span>
          </button>
        </nav>
      </div>

      <div
        className={`fixed top-20 left-0 right-0 bg-bg-primary/98 backdrop-blur-xl border-b border-border p-6 transition-all duration-300 ${isMobileMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"}`}
      >
        <ul className="flex flex-col gap-4 list-none m-0 p-0">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={handleLinkClick}
                className="block text-lg font-semibold py-3 border-b border-border hover:text-accent-primary transition-colors"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="#pricing"
              onClick={handleLinkClick}
              className="block text-center mt-4 px-6 py-4 bg-gradient-primary text-bg-primary font-bold rounded-xl"
            >
              Купить за 300 ₽
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
