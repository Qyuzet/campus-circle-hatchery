import type { Metadata } from "next";
import CTA from "../components/sections/cta/default";
import FAQ from "../components/sections/faq/default";
import Footer from "../components/sections/footer/default";
import Hero from "../components/sections/hero/default";
import Items from "../components/sections/items/default";
import Logos from "../components/sections/logos/default";
import Navbar from "../components/sections/navbar/default";
import Stats from "../components/sections/stats/default";
import { LayoutLines } from "../components/ui/layout-lines";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "CampusCircle - All-in-One Campus Platform for Binus University",
  description:
    "Your all-in-one campus platform for Binus University students. Buy and sell study materials, order campus food, join events, find tutors, and connect with your community in one trusted platform.",
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    title: "CampusCircle - All-in-One Campus Platform for Binus University",
    description:
      "Your all-in-one campus platform for Binus University students. Buy and sell study materials, order campus food, join events, find tutors, and connect with your community.",
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "CampusCircle",
  url: siteConfig.url,
  description: siteConfig.description,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteConfig.url}/dashboard?search={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
  publisher: {
    "@type": "Organization",
    name: "CampusCircle",
    url: siteConfig.url,
    logo: {
      "@type": "ImageObject",
      url: `${siteConfig.url}/campus-circle-logo.png`,
    },
  },
  offers: {
    "@type": "AggregateOffer",
    offerCount: "2500",
    priceCurrency: "IDR",
    availability: "https://schema.org/InStock",
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 text-foreground">
        <LayoutLines />
        <Navbar />
        <main>
          <Hero />
          <Logos />
          <section aria-label="Platform Features">
            <Items />
          </section>
          <section aria-label="Platform Statistics">
            <Stats />
          </section>
          <section aria-label="Frequently Asked Questions" id="faq">
            <FAQ />
          </section>
          <section aria-label="Call to Action">
            <CTA />
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
