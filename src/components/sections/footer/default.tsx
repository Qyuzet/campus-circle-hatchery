import Image from "next/image";
import { ReactNode } from "react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

import {
  Footer,
  FooterBottom,
  FooterColumn,
  FooterContent,
} from "../../ui/footer";
import { ModeToggle } from "../../ui/mode-toggle";

interface FooterLink {
  text: string;
  href: string;
}

interface FooterColumnProps {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  logo?: ReactNode;
  name?: string;
  columns?: FooterColumnProps[];
  copyright?: string;
  policies?: FooterLink[];
  showModeToggle?: boolean;
  className?: string;
}

export default function FooterSection({
  logo = (
    <Image
      src="/campusCircle-logo.png"
      alt="CampusCircle Logo"
      width={32}
      height={32}
      className="h-8 w-8"
    />
  ),
  name = "CampusCircle",
  columns = [
    {
      title: "Platform",
      links: [
        { text: "Marketplace", href: "/dashboard" },
        { text: "Tutoring", href: "/dashboard" },
        { text: "My Library", href: "/library" },
      ],
    },
    {
      title: "Resources",
      links: [
        { text: "How It Works", href: "/" },
        { text: "FAQ", href: "/" },
        { text: "Support", href: siteConfig.links.email },
      ],
    },
    {
      title: "Connect",
      links: [
        { text: "Twitter", href: siteConfig.links.twitter },
        { text: "GitHub", href: siteConfig.links.github },
        { text: "Email", href: siteConfig.links.email },
      ],
    },
  ],
  copyright = "© 2025 CampusCircle. Built for Binus University students.",
  policies = [
    { text: "Privacy Policy", href: "/privacy" },
    { text: "Terms of Service", href: "/terms" },
  ],
  showModeToggle = true,
  className,
}: FooterProps) {
  return (
    <footer className={cn("bg-background w-full px-4", className)}>
      <div className="max-w-container mx-auto">
        <Footer>
          <FooterContent>
            <FooterColumn className="col-span-2 sm:col-span-3 md:col-span-1">
              <div className="flex items-center gap-2">
                {logo}
                <h3 className="text-xl font-bold">
                  <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    Campus
                  </span>
                  <span className="bg-gradient-to-r from-teal-500 to-teal-700 bg-clip-text text-transparent">
                    Circle
                  </span>
                </h3>
              </div>
            </FooterColumn>
            {columns.map((column, index) => (
              <FooterColumn key={index}>
                <h3 className="text-md pt-1 font-semibold">{column.title}</h3>
                {column.links.map((link, linkIndex) => (
                  <a
                    key={linkIndex}
                    href={link.href}
                    className="text-muted-foreground text-sm"
                  >
                    {link.text}
                  </a>
                ))}
              </FooterColumn>
            ))}
          </FooterContent>
          <FooterBottom>
            <div>{copyright}</div>
            <div className="flex items-center gap-4">
              {policies.map((policy, index) => (
                <a key={index} href={policy.href}>
                  {policy.text}
                </a>
              ))}
              {showModeToggle && <ModeToggle />}
            </div>
          </FooterBottom>
        </Footer>
      </div>
    </footer>
  );
}
