import Header from "@/components/header";
import AboutHero from "./components/AboutHero";
import OurStory from "./components/OurStory";
import OurTeam from "./components/OurTeam";
import OurOffice from "./components/OurOffice";
import MapSection from "./components/MapSection";
import Newsletter from "@/components/organisms/Newsletter";
import Footer from "@/components/organisms/Footer";

export default function AboutUsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-lime-300">
      <Header />
      <AboutHero />
      <OurStory />
      <OurTeam />
      <OurOffice />
      <MapSection />
      <Newsletter />
      <Footer />
    </main>
  );
}
