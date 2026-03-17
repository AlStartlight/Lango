import Header from "./components/header";
import HomeThumbnail from "./components/thumbnail";
import ExploreLanguage from "./components/ExploreLanguage";
import LearnWithPeople from "./components/LearnWithPeople";
import LearnTogether from "./components/LearnTogether";
import Newsletter from "./components/organisms/Newsletter";
import Footer from "./components/organisms/Footer";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-lime-300">
      <Header />
      <HomeThumbnail />
      <ExploreLanguage />
      <LearnWithPeople />
      <LearnTogether />
      <Newsletter />
      <Footer />
    </main>
  );
}
