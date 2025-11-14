import {
  Box,
  CircleDot,
  Zap,
  Globe,
  Smartphone,
  Rocket,
  Eye,
  Edit,
} from "lucide-react";
import { ReactNode } from "react";

import { Item, ItemDescription, ItemIcon, ItemTitle } from "../../ui/item";
import { Section } from "../../ui/section";

interface ItemProps {
  title: string;
  description: string;
  icon: ReactNode;
}

interface ItemsProps {
  title?: string;
  items?: ItemProps[] | false;
  className?: string;
}

export default function Items({
  title = "Everything you need for campus trading",
  items = [
    {
      title: "Verified Students Only",
      description:
        "Exclusive access for Binus University students with verified accounts",
      icon: <Eye className="size-5 stroke-1" />,
    },
    {
      title: "Mobile Friendly",
      description: "Browse and trade on any device, anytime, anywhere",
      icon: <Smartphone className="size-5 stroke-1" />,
    },
    {
      title: "Secure Payments",
      description:
        "Integrated with Midtrans for safe and reliable transactions",
      icon: <CircleDot className="size-5 stroke-1" />,
    },
    {
      title: "Study Materials",
      description:
        "Buy and sell notes, books, assignments, and study resources",
      icon: <Box className="size-5 stroke-1" />,
    },
    {
      title: "Fast & Easy",
      description: "List items in seconds, find what you need instantly",
      icon: <Zap className="size-5 stroke-1" />,
    },
    {
      title: "PDF Documents",
      description: "All materials in standardized PDF format for easy access",
      icon: <Rocket className="size-5 stroke-1" />,
    },
    {
      title: "Campus Community",
      description: "Built by students, for students at Binus University",
      icon: <Globe className="size-5 stroke-1" />,
    },
    {
      title: "Real-time Messaging",
      description: "Chat directly with buyers and sellers for quick deals",
      icon: <Edit className="size-5 stroke-1" />,
    },
  ],
  className,
}: ItemsProps) {
  return (
    <Section className={className}>
      <div className="max-w-container mx-auto flex flex-col items-center gap-6 sm:gap-20">
        <h2 className="max-w-[560px] text-center text-3xl leading-tight font-semibold sm:text-5xl sm:leading-tight">
          {title}
        </h2>
        {items !== false && items.length > 0 && (
          <div className="grid auto-rows-fr grid-cols-2 gap-0 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {items.map((item, index) => (
              <Item key={index}>
                <ItemTitle className="flex items-center gap-2">
                  <ItemIcon>{item.icon}</ItemIcon>
                  {item.title}
                </ItemTitle>
                <ItemDescription>{item.description}</ItemDescription>
              </Item>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
