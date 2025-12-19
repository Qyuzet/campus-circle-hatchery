import { type VariantProps } from "class-variance-authority";
import { ArrowRightIcon } from "lucide-react";
import { ReactNode } from "react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

import SignInButton from "@/components/SignInButton";
import Github from "@/components/logos/github";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import Glow from "@/components/ui/glow";
import { Mockup, MockupFrame } from "@/components/ui/mockup";
import Screenshot from "@/components/ui/screenshot";
import { Section } from "@/components/ui/section";

interface HeroButtonProps {
  href: string;
  text: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  icon?: ReactNode;
  iconRight?: ReactNode;
}

interface HeroProps {
  title?: string;
  description?: string;
  mockup?: ReactNode | false;
  badge?: ReactNode | false;
  buttons?: HeroButtonProps[] | false;
  className?: string;
}

export default function Hero({
  title = "Your Campus Marketplace for Study Materials & Services",
  description = "Exclusively for Binus University students. Buy, sell, and exchange study materials, notes, and tutoring services in a trusted community.",
  mockup = (
    <Screenshot
      srcLight="/binus-student.png"
      srcDark="/binus-student.png"
      alt="Binus University Students"
      width={1248}
      height={765}
      className="w-full"
    />
  ),
  badge = (
    <Badge variant="outline" className="animate-appear">
      <span className="text-muted-foreground">
        Exclusive for Binus Students
      </span>
      <a href={siteConfig.getStartedUrl} className="flex items-center gap-1">
        Join Now
        <ArrowRightIcon className="size-3" />
      </a>
    </Badge>
  ),
  buttons = false,
  className,
}: HeroProps) {
  return (
    <Section
      className={cn(
        "fade-bottom overflow-hidden pb-0 sm:pb-0 md:pb-0",
        className
      )}
    >
      <div className="max-w-container mx-auto flex flex-col gap-12 -mt-8 sm:gap-24">
        <div className="flex flex-col items-center gap-6 text-center sm:gap-12">
          {badge !== false && badge}
          <h1 className="animate-appear relative z-10 text-4xl leading-tight font-bold text-gray-900 text-balance sm:text-6xl sm:leading-tight md:text-7xl md:leading-tight">
            {title}
          </h1>
          <p className="text-md animate-appear relative z-10 max-w-[740px] font-normal text-muted-foreground text-balance opacity-0 delay-100 sm:text-xl">
            {description}
          </p>
          <div className="animate-appear relative z-10 flex justify-center gap-4 opacity-0 delay-300">
            <SignInButton text="Start Exploring" variant="default" />
          </div>
          {mockup !== false && (
            <div className="relative w-full pt-12">
              <MockupFrame
                className="animate-appear opacity-0 delay-700"
                size="small"
              >
                <Mockup
                  type="responsive"
                  className="bg-background/90 w-full rounded-xl border-0"
                >
                  {mockup}
                </Mockup>
              </MockupFrame>
              <Glow
                variant="top"
                className="animate-appear-zoom opacity-0 delay-1000"
              />
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
