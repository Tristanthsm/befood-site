import Link from "next/link";
import type { ReactNode } from "react";

import { cn, isExternalUrl } from "@/lib/utils";

interface FeyButtonLinkProps {
  href?: string | null;
  className?: string;
  children: ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        stroke="#4B5563"
        strokeWidth="1.5"
        d="M13.5 12.8053C14.2525 12.3146 14.75 11.4654 14.75 10.5C14.75 8.98122 13.5188 7.75 12 7.75C10.4812 7.75 9.25 8.98122 9.25 10.5C9.25 11.4654 9.74745 12.3146 10.5 12.8053L10.5 14.75C10.5 15.5784 11.1716 16.25 12 16.25C12.8284 16.25 13.5 15.5784 13.5 14.75L13.5 12.8053Z"
      />
      <circle
        cx="12"
        cy="12"
        r="9.25"
        stroke="#4B5563"
        strokeWidth="1.5"
      />
    </svg>
  );
}

const baseClasses = cn(
  "group relative inline-flex items-center justify-center gap-1",
  "h-10 min-w-[180px] whitespace-nowrap rounded-[28px] px-4 py-2",
  "text-sm font-semibold leading-tight text-[#1F2937]",
  "bg-[radial-gradient(61.35%_50.07%_at_48.58%_50%,rgb(255,255,255)_0%,rgba(0,0,0,0.02)_100%)]",
  "[box-shadow:inset_0_0_0_0.5px_rgba(148,163,184,0.6),inset_1px_1px_0_-0.5px_rgba(148,163,184,0.65),inset_-1px_-1px_0_-0.5px_rgba(148,163,184,0.65)]",
  "transition",
  "after:absolute after:inset-0 after:rounded-[28px] after:opacity-0 after:transition-opacity after:duration-200",
  "after:bg-[radial-gradient(61.35%_50.07%_at_48.58%_50%,rgb(255,255,255)_0%,rgb(242,242,242)_100%)]",
  "after:[box-shadow:inset_0_0_0_0.5px_rgba(148,163,184,0.75),inset_1px_1px_0_-0.5px_rgba(148,163,184,0.75),inset_-1px_-1px_0_-0.5px_rgba(148,163,184,0.75),0_0_3px_rgba(255,255,255,0.55)]",
  "hover:after:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60",
);

function ButtonInner({ children }: { children: ReactNode }) {
  return (
    <span className="relative z-10 flex items-center gap-1">
      <LockIcon />
      {children}
    </span>
  );
}

export function FeyButtonLink({
  href,
  className,
  children,
  disabled = false,
  ariaLabel,
}: FeyButtonLinkProps) {
  const classes = cn(baseClasses, disabled && "cursor-not-allowed opacity-50", className);

  if (!href || disabled) {
    return (
      <span aria-disabled className={classes}>
        <ButtonInner>{children}</ButtonInner>
      </span>
    );
  }

  if (isExternalUrl(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel} className={classes}>
        <ButtonInner>{children}</ButtonInner>
      </a>
    );
  }

  return (
    <Link href={href} aria-label={ariaLabel} className={classes}>
      <ButtonInner>{children}</ButtonInner>
    </Link>
  );
}
