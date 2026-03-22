import Header from "../components/header";
import PricingHero from "./components/PricingHero";
import PricingCards from "./components/PricingCards";
import Newsletter from "../components/organisms/Newsletter";
import Footer from "../components/organisms/Footer";

export default function PricingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-lime-300">
      <Header />
      <PricingHero />
      <PricingCards />
      <Newsletter />
      <Footer />
    </main>
  );
}
