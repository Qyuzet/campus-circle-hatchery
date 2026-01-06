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
            This ensures a trusted and safe community where you can buy, sell,
            and connect with verified fellow students.
          </p>
        </>
      ),
    },
    {
      question: "What is My AI Notes?",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[600px]">
            My AI Notes is our built-in AI-powered note-taking system. Create
            and organize notes using a block-based editor with support for text,
            tables, code blocks, and flowcharts (Mermaid diagrams).
          </p>
          <p className="text-muted-foreground mb-4 max-w-[600px]">
            The AI assistant can help improve your writing, generate content,
            create summaries, and even auto-fill notes from uploaded documents
            like PDFs and Word files.
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
            transactions. You can pay using credit cards, bank transfers, GoPay,
            and other e-wallets.
          </p>
          <p className="text-muted-foreground mb-4 max-w-[600px]">
            All payments are encrypted and secure. Sellers receive their funds
            in their wallet balance after successful transactions.
          </p>
        </>
      ),
    },
    {
      question: "What can I buy and sell?",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            You can buy and sell study materials (notes, textbooks,
            assignments), order food from campus vendors, register for events
            and workshops, and book tutoring sessions.
          </p>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            All listings must comply with university policies. The platform
            supports digital files with automatic thumbnail generation and
            AI-powered metadata extraction.
          </p>
        </>
      ),
    },
    {
      question: "How do I join or create a club?",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            Browse available clubs in the Clubs section and click Join to send a
            membership request. Club organizers will review and approve your
            request.
          </p>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            To create a new club, use the Create Club feature. You can manage
            members, post announcements, and organize club events from your
            dashboard.
          </p>
        </>
      ),
    },
    {
      question: "How do I withdraw my earnings?",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            Go to the Wallet section to view your balance and transaction
            history. Click Withdraw to request a withdrawal to your bank
            account. Withdrawals are processed within 1-3 business days.
          </p>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            You can track all your sales, purchases, and withdrawal requests
            from the Wallet dashboard.
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
