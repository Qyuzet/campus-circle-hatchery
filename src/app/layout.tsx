import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import { ThemeProvider } from "@/components/contexts/theme-provider";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "CampusCircle - All-in-One Campus Platform for Binus University",
    template: "%s | CampusCircle",
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [
    {
      name: "CampusCircle Team",
      url: siteConfig.url,
    },
  ],
  creator: "CampusCircle",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: "CampusCircle - All-in-One Campus Platform for Binus University",
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "CampusCircle - Campus Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CampusCircle - All-in-One Campus Platform for Binus University",
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@campuscircle",
  },
  icons: {
    icon: "/campus-circle-icon.png",
    shortcut: "/campus-circle-icon.png",
    apple: "/campus-circle-icon.png",
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const midtransClientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";
  const midtransSnapUrl =
    process.env.MIDTRANS_IS_PRODUCTION === "true"
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="application-name" content="CampusCircle" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CampusCircle" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#3b82f6" />
        <link rel="apple-touch-icon" href="/campus-circle-icon.png" />
        {midtransClientKey && (
          <script
            type="text/javascript"
            src={midtransSnapUrl}
            data-client-key={midtransClientKey}
            async
          ></script>
        )}
      </head>
      <body>
        <ThemeProvider>
          <SessionProvider>{children}</SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
