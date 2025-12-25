import Link from "next/link";
import { ReactNode } from "react";

import { siteConfig } from "@/config/site";

import {
  AccordionSSR,
  AccordionContentSSR,
  AccordionItemSSR,
  AccordionTriggerSSR,
} from "../../ui/accordion-ssr";
import { Section } from "../../ui/section";

interface FAQItemProps {
  question: string;
  answer: ReactNode;
  value?: string;
}

interface FAQProps {
  title?: string;
  items?: FAQItemProps[] | false;
  className?: string;
}

export default function FAQ({
  title = "Frequently Asked Questions",
  items = [
    {
      question: "Who can use CampusCircle?",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[640px] text-balance">
            CampusCircle is exclusively for Binus University students. You need
            to sign in with your Binus Google account (@binus.ac.id or
            @binus.edu) to access the platform.
          </p>
          <p className="text-muted-foreground mb-4 max-w-[640px] text-balance">
            This ensures a trusted and safe community for all users.
          </p>
        </>
      ),
    },
    {
      question: "How do payments work?",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[600px]">
            We use Midtrans, a secure payment gateway, to process all
            transactions. You can pay using various methods including credit
            cards, bank transfers, and e-wallets.
          </p>
          <p className="text-muted-foreground mb-4 max-w-[600px]">
            All payments are encrypted and secure. Sellers receive their funds
            after successful delivery confirmation.
          </p>
          <p className="text-muted-foreground mb-4 max-w-[600px]">
            We charge a small platform fee to maintain and improve the service.
            CampusCircle is completely free to use for all Binus students.
          </p>
        </>
      ),
    },
    {
      question: "What can I buy and sell on CampusCircle?",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            You can buy and sell study materials (notes, textbooks,
            assignments), order campus food from fellow students, register for
            events and workshops, and book tutoring sessions.
          </p>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            All items must be related to academic or campus life purposes and
            comply with university policies. Prohibited items will be removed.
          </p>
        </>
      ),
    },
    {
      question: "Is CampusCircle free to use?",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            Yes! CampusCircle is completely free for all Binus University
            students. There are no subscription fees or hidden charges.
          </p>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            We only charge a small transaction fee when you make a purchase to
            cover payment processing costs and platform maintenance.
          </p>
        </>
      ),
    },
    {
      question: "How do I contact a seller or buyer?",
      answer: (
        <p className="text-muted-foreground mb-4 max-w-[580px]">
          Once you find an item you&apos;re interested in, you can use our
          built-in real-time messaging system to chat directly with the seller.
          Simply click the &quot;Message Seller&quot; button on any listing to
          start a conversation. You can also send order requests for food items
          directly through chat.
        </p>
      ),
    },
    {
      question: "How do I withdraw my earnings?",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            Go to the Wallet section in your dashboard to view your balance and
            transaction history. Click &quot;Withdraw Funds&quot; to request a
            withdrawal to your bank account. Withdrawals are processed within
            1-3 business days.
          </p>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            You can track all your sales, purchases, and withdrawal requests in
            the Wallet tab.
          </p>
        </>
      ),
    },
  ],
  className,
}: FAQProps) {
  return (
    <Section className={className}>
      <div className="max-w-container mx-auto flex flex-col items-center gap-8">
        <h2 className="text-center text-3xl font-semibold sm:text-5xl">
          {title}
        </h2>
        {items !== false && items.length > 0 && (
          <AccordionSSR className="w-full max-w-[800px]">
            {items.map((item, index) => (
              <AccordionItemSSR key={index}>
                <AccordionTriggerSSR>{item.question}</AccordionTriggerSSR>
                <AccordionContentSSR>{item.answer}</AccordionContentSSR>
              </AccordionItemSSR>
            ))}
          </AccordionSSR>
        )}
      </div>
    </Section>
  );
}
