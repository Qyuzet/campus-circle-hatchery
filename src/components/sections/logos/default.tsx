import Image from "next/image";
import { ReactNode } from "react";

import { siteConfig } from "@/config/site";

import { Badge } from "../../ui/badge";
import { Section } from "../../ui/section";

interface LogosProps {
  title?: string;
  badge?: ReactNode | false;
  logos?: ReactNode[] | false;
  className?: string;
}

export default function Logos({
  title = "Trusted Infrastructure & Community",
  badge = (
    <Badge variant="outline" className="border-blue-600/30 text-blue-600">
      Powered by
    </Badge>
  ),
  logos = [
    <div key="gcp" className="flex flex-col items-center gap-2">
      <Image
        src="/google-cloud.png"
        alt="Google Cloud"
        width={120}
        height={40}
        className="h-10 w-auto object-contain"
      />
    </div>,
    <div key="aws" className="flex flex-col items-center gap-2">
      <Image
        src="/aws.png"
        alt="AWS"
        width={120}
        height={40}
        className="h-10 w-auto object-contain"
      />
    </div>,
    <div key="gdg" className="flex flex-col items-center gap-2">
      <Image
        src="/google-dev-binter.png"
        alt="Google Developer Group"
        width={252}
        height={84}
        className="h-[5.6rem] w-auto object-contain"
      />
    </div>,
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
