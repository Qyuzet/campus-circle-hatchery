import { type VariantProps } from "class-variance-authority";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

import { Button, buttonVariants } from "../../ui/button";
import {
  Navbar as NavbarComponent,
  NavbarLeft,
  NavbarRight,
} from "../../ui/navbar";
import GoogleSignInButton from "@/components/GoogleSignInButton";

interface NavbarLink {
  text: string;
  href: string;
}

interface NavbarActionProps {
  text: string;
  href: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  icon?: ReactNode;
  iconRight?: ReactNode;
  isButton?: boolean;
}

interface NavbarProps {
  logo?: ReactNode;
  name?: string;
  homeUrl?: string;
  mobileLinks?: NavbarLink[];
  actions?: NavbarActionProps[];
  showNavigation?: boolean;
  customNavigation?: ReactNode;
  className?: string;
}

export default function Navbar({
  logo = (
    <Image
      src="/campus-circle-logo.png"
      alt="CampusCircle Logo"
      width={240}
      height={60}
      className="h-16 w-auto"
    />
  ),
  name = "",
  homeUrl = "/",
  mobileLinks = [],
  actions = [
    {
      text: "Join Now",
      href: "/dashboard",
      isButton: true,
      variant: "default",
    },
  ],
  showNavigation = false,
  customNavigation,
  className,
}: NavbarProps) {
  return (
    <header className={cn("sticky top-0 z-50 -mb-4 px-4 pb-4", className)}>
      <div className="fade-bottom bg-white/70 absolute left-0 h-24 w-full backdrop-blur-lg"></div>
      <div className="max-w-container relative mx-auto">
        <NavbarComponent>
          <NavbarLeft>
            <Link href={homeUrl} className="flex items-center">
              {logo}
            </Link>
            {showNavigation && customNavigation}
          </NavbarLeft>
          <NavbarRight>
            <GoogleSignInButton text="Join Now" variant="default" />
          </NavbarRight>
        </NavbarComponent>
      </div>
    </header>
  );
}
