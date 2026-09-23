import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Игровая витрина для заработка на рекламе | GameOnline",
  description:
    "Готовая игровая витрина для создания и развития собственного проекта. Запустите сайт с каталогом игр за 300₽.",
  keywords: [
    "игровая витрина",
    "заработок на играх",
    "каталог игр",
    "GameShowcase",
  ],
  openGraph: {
    title: "GameShowcase - Игровая витрина",
    description:
      "Готовая игровая витрина для создания и развития собственного проекта.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className="scroll-smooth">
      <body className="antialiased min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
