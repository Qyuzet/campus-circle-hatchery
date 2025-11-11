import { ReactNode } from "react";

import { siteConfig } from "@/config/site";

import Figma from "../../logos/figma";
import React from "../../logos/react";
import ShadcnUi from "../../logos/shadcn-ui";
import Tailwind from "../../logos/tailwind";
import TypeScript from "../../logos/typescript";
import { Badge } from "../../ui/badge";
import Logo from "../../ui/logo";
import { Section } from "../../ui/section";

interface LogosProps {
  title?: string;
  badge?: ReactNode | false;
  logos?: ReactNode[] | false;
  className?: string;
}

export default function Logos({
  title = "Built with modern technologies for the best experience",
  badge = (
    <Badge variant="outline" className="border-brand/30 text-brand">
      Powered by Next.js & Vercel
    </Badge>
  ),
  logos = [
    <Logo key="react" image={React} name="React" version="18" />,
    <Logo
      key="typescript"
      image={TypeScript}
      name="TypeScript"
      version="5.x"
    />,
    <Logo key="shadcn" image={ShadcnUi} name="Shadcn/ui" badge="UI" />,
    <Logo key="tailwind" image={Tailwind} name="Tailwind" version="3.x" />,
  ],
  className,
}: LogosProps) {
  return (
    <Section className={className}>
      <div className="max-w-container mx-auto flex flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-6">
          {badge !== false && badge}
          <h2 className="text-md font-semibold sm:text-2xl">{title}</h2>
        </div>
        {logos !== false && logos.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-8">
            {logos}
          </div>
        )}
      </div>
    </Section>
  );
}
