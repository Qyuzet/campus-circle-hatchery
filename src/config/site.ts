export const siteConfig = {
  name: "CampusCircle",
  url: "https://campuscircle.vercel.app",
  getStartedUrl: "/dashboard",
  ogImage: "/campusCircle-logo.png",
  description:
    "Exclusive marketplace for Binus University students to buy, sell, and exchange study materials, notes, assignments, and books in PDF format.",
  links: {
    twitter: "https://twitter.com/campuscircle",
    github: "https://github.com/Qyuzet/campus-circle-hatchery",
    email: "mailto:support@campuscircle.com",
  },
  pricing: {
    pro: "/dashboard",
    team: "/dashboard",
  },
  stats: {
    figma: 500,
    github: 150,
    cli: 1200,
    total: "1.8k+",
    updated: "11 Jan 2025",
    sections: 5,
    illustrations: 10,
    animations: 8,
    appTemplates: 1,
    websiteTemplates: 1,
  },
};

export type SiteConfig = typeof siteConfig;
