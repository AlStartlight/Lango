import Header from "@/components/header";
import HowHero from "./components/HowHero";
import StartLearning from "./components/StartLearning";
import HeroLearn from "@/components/HeroLearn";
import HeroSpeakers from "@/components/HeroSpeakers";
import LanguageForAll from "./components/LanguageForAll";
import RatingsSection from "@/components/organisms/RatingsSection";
import LovedByLearners from "./components/LovedByLearners";
import BlogSection from "./components/BlogSection";
import Newsletter from "@/components/organisms/Newsletter";
import Footer from "@/components/organisms/Footer";

export default function HowItsWorksPage() {
  return (
    <main className="flex  min-h-screen flex-col items-center bg-lime-300">
      <Header />
      <HowHero />
      <StartLearning />
      <HeroLearn />
      <HeroSpeakers />
      <LanguageForAll />
      <RatingsSection />
      <LovedByLearners />
      <BlogSection />
      <Newsletter />
      <Footer />
    </main>
  );
}
