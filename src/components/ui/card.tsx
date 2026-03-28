import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <article
      className={cn(
        "rounded-[var(--radius-card)] border border-[color:rgb(16_36_42_/10%)] bg-[var(--color-panel)] p-6 shadow-[var(--shadow-card)]",
        className,
      )}
    >
      {children}
    </article>
  );
}
