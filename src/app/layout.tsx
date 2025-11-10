import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CampusCircle - Binus University Student Marketplace",
  description:
    "A platform for Binus University students to exchange study materials, notes, and services",
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
    <html lang="en">
      <head>
        <script
          type="text/javascript"
          src={midtransSnapUrl}
          data-client-key={midtransClientKey}
        ></script>
      </head>
      <body className={inter.className}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
