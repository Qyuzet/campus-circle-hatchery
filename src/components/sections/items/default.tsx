import {
  BookOpen,
  ShoppingCart,
  Calendar,
  MessageCircle,
  Wallet,
  GraduationCap,
  Users,
  Sparkles,
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
        "Buy and sell notes, textbooks, and study resources. AI-powered metadata extraction with instant PDF downloads and thumbnails",
      icon: <BookOpen className="size-5 stroke-1" />,
    },
    {
      title: "Campus Food Ordering",
      description:
        "Order food from campus vendors, schedule pickup times, and track your order status in real-time",
      icon: <ShoppingCart className="size-5 stroke-1" />,
    },
    {
      title: "Events & Workshops",
      description:
        "Discover and register for campus events, workshops, and activities. Pay for tickets and manage your registrations",
      icon: <Calendar className="size-5 stroke-1" />,
    },
    {
      title: "Student Clubs",
      description:
        "Browse and join university clubs, participate in club events, and connect with like-minded students",
      icon: <Users className="size-5 stroke-1" />,
    },
    {
      title: "Tutoring Services",
      description:
        "Find expert tutors for any subject or offer your own tutoring services. Schedule and manage sessions easily",
      icon: <GraduationCap className="size-5 stroke-1" />,
    },
    {
      title: "Real-time Messaging",
      description:
        "Chat directly with buyers, sellers, and tutors. Group messaging for clubs and study groups",
      icon: <MessageCircle className="size-5 stroke-1" />,
    },
    {
      title: "My AI Notes",
      description:
        "Create notes with AI-powered writing assistance, auto-generate tables, flowcharts, and summaries from documents",
      icon: <Sparkles className="size-5 stroke-1" />,
    },
    {
      title: "Digital Wallet",
      description:
        "Track earnings, manage transactions, and withdraw funds. Secure payments via Midtrans with multiple payment methods",
      icon: <Wallet className="size-5 stroke-1" />,
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
