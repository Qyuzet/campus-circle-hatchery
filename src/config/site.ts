export const siteConfig = {
  name: "CampusCircle",
  url: "https://campuscircle.vercel.app",
  getStartedUrl: "/dashboard",
  ogImage: "/campus-circle-logo.png",
  description:
    "Your all-in-one campus platform for Binus University students. Buy and sell study materials, order campus food, join events, find tutors, and connect with your community in one trusted platform.",
  keywords: [
    "Binus University",
    "campus marketplace",
    "study materials",
    "campus food ordering",
    "student events",
    "tutoring services",
    "student community",
    "academic resources",
    "campus platform",
    "student marketplace",
  ],
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
