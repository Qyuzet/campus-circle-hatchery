import { type VariantProps } from "class-variance-authority";
import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

import SignInButton from "@/components/SignInButton";
import { Button, buttonVariants } from "../../ui/button";
import {
  Navbar as NavbarComponent,
  NavbarLeft,
  NavbarRight,
} from "../../ui/navbar";
import Navigation from "../../ui/navigation";
import { Sheet, SheetContent, SheetTrigger } from "../../ui/sheet";

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
            {showNavigation && (customNavigation || <Navigation />)}
          </NavbarLeft>
          <NavbarRight>
            <SignInButton text="Join Now" variant="default" />
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 md:hidden"
                >
                  <Menu className="size-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="grid gap-6 text-lg font-medium">
                  <Link href={homeUrl} className="flex items-center gap-2">
                    {logo}
                    <span className="text-xl font-bold">
                      <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                        Campus
                      </span>
                      <span className="bg-gradient-to-r from-teal-500 to-teal-700 bg-clip-text text-transparent">
                        Circle
                      </span>
                    </span>
                  </Link>
                  <div className="mt-4">
                    <SignInButton
                      text="Join Now"
                      variant="default"
                      className="w-full"
                    />
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </NavbarRight>
        </NavbarComponent>
      </div>
    </header>
  );
}
