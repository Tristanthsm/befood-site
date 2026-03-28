import Link from "next/link";
import type { ReactNode } from "react";

import { cn, isExternalUrl } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonSize = "md" | "lg";

interface BaseButtonProps {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

interface ButtonLinkProps extends BaseButtonProps {
  href?: string | null;
  disabled?: boolean;
  ariaLabel?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-accent)] text-white shadow-[var(--shadow-soft)] hover:bg-[var(--color-accent-strong)] focus-visible:outline-[var(--color-accent)]",
  secondary:
    "bg-white text-[var(--color-ink)] ring-1 ring-[var(--color-border-strong)] hover:bg-[var(--color-surface)] focus-visible:outline-[var(--color-accent)]",
  ghost:
    "bg-transparent text-[var(--color-ink)] ring-1 ring-[var(--color-border)] hover:bg-[var(--color-surface)] focus-visible:outline-[var(--color-accent)]",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export function ButtonLink({
  children,
  className,
  variant = "primary",
  size = "md",
  href,
  disabled = false,
  ariaLabel,
}: ButtonLinkProps) {
  const sharedClasses = cn(
    "inline-flex items-center justify-center rounded-full font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
    variantClasses[variant],
    sizeClasses[size],
    disabled && "cursor-not-allowed opacity-60",
    className,
  );

  if (!href || disabled) {
    return (
      <span aria-disabled className={sharedClasses}>
        {children}
      </span>
    );
  }

  if (isExternalUrl(href)) {
    return (
      <a
        className={sharedClasses}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
      >
        {children}
      </a>
    );
  }

  return (
    <Link className={sharedClasses} href={href} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}
