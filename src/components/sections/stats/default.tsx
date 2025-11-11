import { siteConfig } from "@/config/site";

import { Section } from "../../ui/section";

interface StatItemProps {
  label?: string;
  value: string | number;
  suffix?: string;
  description?: string;
}

interface StatsProps {
  items?: StatItemProps[] | false;
  className?: string;
}

export default function Stats({
  items = [
    {
      label: "over",
      value: "500",
      suffix: "+",
      description: "active Binus students",
    },
    {
      label: "more than",
      value: "1.2",
      suffix: "k",
      description: "study materials listed",
    },
    {
      label: "already",
      value: "300",
      suffix: "+",
      description: "successful transactions",
    },
    {
      label: "trusted by",
      value: "150",
      suffix: "+",
      description: "verified tutors",
    },
  ],
  className,
}: StatsProps) {
  return (
    <Section className={className}>
      <div className="container mx-auto max-w-[960px]">
        {items !== false && items.length > 0 && (
          <div className="grid grid-cols-2 gap-12 sm:grid-cols-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-start gap-3 text-left"
              >
                {item.label && (
                  <div className="text-muted-foreground text-sm font-semibold">
                    {item.label}
                  </div>
                )}
                <div className="flex items-baseline gap-2">
                  <div className="text-foreground text-4xl font-bold transition-all duration-300 sm:text-5xl md:text-6xl">
                    {item.value}
                  </div>
                  {item.suffix && (
                    <div className="text-foreground text-2xl font-semibold">
                      {item.suffix}
                    </div>
                  )}
                </div>
                {item.description && (
                  <div className="text-muted-foreground text-sm font-semibold text-pretty">
                    {item.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
