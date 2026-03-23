import Header from "@/components/header";
import ReviewsHero from "./components/ReviewsHero";
import RatingsSection from "@/components/organisms/RatingsSection";
import TestimonialsGrid from "./components/TestimonialsGrid";
import Newsletter from "@/components/organisms/Newsletter";
import Footer from "@/components/organisms/Footer";

export default function ReviewsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-lime-300">
      <Header />
      <ReviewsHero />
      <RatingsSection />
      <TestimonialsGrid />
      <Newsletter />
      <Footer />
    </main>
  );
}
