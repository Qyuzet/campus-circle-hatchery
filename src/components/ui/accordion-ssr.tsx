import * as React from "react";
import { cn } from "@/lib/utils";

function AccordionSSR({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      {children}
    </div>
  );
}

function AccordionItemSSR({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDetailsElement>) {
  return (
    <details
      className={cn(
        "group rounded-lg border border-gray-200 bg-white p-6 transition-all hover:border-gray-300",
        className
      )}
      {...props}
    >
      {children}
    </details>
  );
}

function AccordionTriggerSSR({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <summary
      className={cn(
        "flex cursor-pointer items-center justify-between text-lg font-semibold text-gray-900 list-none",
        "[&::-webkit-details-marker]:hidden",
        "group-open:mb-4",
        className
      )}
      {...props}
    >
      {children}
      <svg
        className="h-5 w-5 transition-transform group-open:rotate-180"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </summary>
  );
}

function AccordionContentSSR({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("text-gray-700", className)} {...props}>
      {children}
    </div>
  );
}

export { AccordionSSR, AccordionItemSSR, AccordionTriggerSSR, AccordionContentSSR };

