import Header from "../components/header";
import LanguagesHero from "./components/LanguagesHero";
import LanguageFeatures from "./components/LanguageFeatures";
import Newsletter from "../components/organisms/Newsletter";
import Footer from "../components/organisms/Footer";
import WhyDoYou from "./components/WhyDoYou";

export default function LanguagesPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-lime-300">
      <Header />
      <LanguagesHero />
      <WhyDoYou />
      <LanguageFeatures />
      <Newsletter />
      <Footer />
    </main>
  );
}
