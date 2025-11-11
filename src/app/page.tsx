import CTA from "../components/sections/cta/default";
import FAQ from "../components/sections/faq/default";
import Footer from "../components/sections/footer/default";
import Hero from "../components/sections/hero/default";
import Items from "../components/sections/items/default";
import Logos from "../components/sections/logos/default";
import Navbar from "../components/sections/navbar/default";
import Stats from "../components/sections/stats/default";
import { LayoutLines } from "../components/ui/layout-lines";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 text-foreground">
      <LayoutLines />
      <Navbar />
      <Hero />
      <Logos />
      <Items />
      <Stats />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
