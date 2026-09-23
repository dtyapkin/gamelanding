// import { Footer } from "@/components/layout/Footer";
// import { Header } from "@/components/layout/Header";
// import { RightSidebarExtra } from "@/components/layout/RightSidebarExtra";
// import { Sidebar } from "@/components/layout/Sidebar";
import PublicOfferSection from "@/components/sections/PublicOfferSection";

export const metadata = {
  title: "Публичная оферта | Игровой портал",
  description: "Узнайте больше о нашей миссии и команде энтузиастов.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-dark">
      {/* <Header /> */}
      <div className="max-w-900 mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex gap-4 sm:gap-6">
          {/* <div className="hidden lg:block shrink-0 ">
            <Sidebar />
          </div> */}
          <main className="flex-1 min-w-0 mainTwo">
            {/* <h1 className="text-3xl font-bold text-white  mb-2">О нас</h1> */}

            <PublicOfferSection />
          </main>
          {/* <div className="hidden xl:block shrink-0">
            <RightSidebarExtra />
          </div> */}
        </div>
      </div>
      {/* <Footer /> */}
    </div>
  );
}
