import CompareTwo from "@/components/CompareTwo";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import HeroNext from "@/components/HeroNext";
import HeroNextEight from "@/components/HeroNextEight";
import HeroNextFifteen from "@/components/HeroNextFifteen";
import HeroNextFourteenNew from "@/components/HeroNextFourteenNew";
import HeroNextThirteen from "@/components/HeroNextThirteen";
import HeroNextThirteenTwo from "@/components/HeroNextThirteenTwo";
import HeroNextTwelveNew from "@/components/HeroNextTwelveNew";
// import HeroNextTwentyOneNew from "@/components/HeroNextTwentyOneNew";
// import HowItMade from "@/components/HowItMade";
// import LearnSection from "@/components/LearnSection";
import Pricing from "@/components/Pricing";
// import Warranty from "@/components/Warranty";
import WhatIncludedNew from "@/components/WhatIncludedNew";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroNext />
        <HeroNextThirteenTwo />
        {/* <HeroNextThirteen /> */}
        <HeroNextEight />
        <HeroNextFourteenNew />
        <HeroBanner />
        <HeroNextThirteen />
        {/* <HeroNextFifteen /> */}
        <HeroNextTwelveNew />
        {/* <HowItMade />
        <LearnSection /> 
        {/* <HeroNextTwentyOneNew /> */}
        <Pricing />
        <CompareTwo />
        <WhatIncludedNew />
        {/* <Warranty /> */}
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
