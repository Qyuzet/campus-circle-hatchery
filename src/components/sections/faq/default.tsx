import Link from "next/link";
import { ReactNode } from "react";

import { siteConfig } from "@/config/site";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../ui/accordion";
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
            You can trade study materials like notes, textbooks, past exam
            papers, and course materials. We also support tutoring services
            where you can offer or find academic help.
          </p>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            All items must be related to academic purposes and comply with
            university policies. Prohibited items will be removed.
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
      question: "How do I contact a seller?",
      answer: (
        <p className="text-muted-foreground mb-4 max-w-[580px]">
          Once you find an item you&apos;re interested in, you can use our
          built-in messaging system to chat directly with the seller. Simply
          click the &quot;Message Seller&quot; button on any listing to start a
          conversation. .
        </p>
      ),
    },
    {
      question: "Can I get a discount?",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            Actually, yes! I&apos;m always acively looking for beta testers of
            new features. If you are interested in exchanging feedback for a
            discount, please contact me via{" "}
            <a
              href={siteConfig.links.email}
              className="underline underline-offset-2"
            >
              email
            </a>
            .
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
          <Accordion type="single" collapsible className="w-full max-w-[800px]">
            {items.map((item, index) => (
              <AccordionItem
                key={index}
                value={item.value || `item-${index + 1}`}
              >
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </Section>
  );
}
