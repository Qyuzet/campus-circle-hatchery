import {
  BookOpen,
  ShoppingCart,
  Calendar,
  MessageCircle,
  Wallet,
  GraduationCap,
  Shield,
  Zap,
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
  title = "Everything you need for campus life",
  items = [
    {
      title: "Study Materials Marketplace",
      description:
        "Buy and sell notes, books, assignments, and study resources with AI-powered metadata and instant PDF downloads",
      icon: <BookOpen className="size-5 stroke-1" />,
    },
    {
      title: "Campus Food Ordering",
      description:
        "Order food from fellow students, schedule pickup times, and pay securely through the platform",
      icon: <ShoppingCart className="size-5 stroke-1" />,
    },
    {
      title: "Events & Activities",
      description:
        "Discover campus events, workshops, and activities. Register and pay for tickets all in one place",
      icon: <Calendar className="size-5 stroke-1" />,
    },
    {
      title: "Tutoring Services",
      description:
        "Find expert tutors or offer your tutoring services. Schedule sessions and manage payments seamlessly",
      icon: <GraduationCap className="size-5 stroke-1" />,
    },
    {
      title: "Real-time Messaging",
      description:
        "Chat directly with buyers, sellers, and tutors. Send order requests and negotiate deals instantly",
      icon: <MessageCircle className="size-5 stroke-1" />,
    },
    {
      title: "Digital Wallet",
      description:
        "Track your earnings, manage transactions, and withdraw funds securely to your bank account",
      icon: <Wallet className="size-5 stroke-1" />,
    },
    {
      title: "Secure Payments",
      description:
        "Integrated with Midtrans payment gateway supporting GoPay, bank transfers, and credit cards",
      icon: <Shield className="size-5 stroke-1" />,
    },
    {
      title: "Fast & Easy",
      description:
        "List items in seconds, find what you need instantly with smart search and AI autofill",
      icon: <Zap className="size-5 stroke-1" />,
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
