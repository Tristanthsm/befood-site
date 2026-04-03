"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface HeaderStartFreeCtaProps {
  className: string;
  trackingLocation: string;
}

export function HeaderStartFreeCta({ className, trackingLocation }: HeaderStartFreeCtaProps) {
  const pathname = usePathname();

  if (pathname === "/app") {
    return null;
  }

  return (
    <Link href="/app" data-cta-track="start_free" data-cta-location={trackingLocation} className={className}>
      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_22%,rgba(255,255,255,0.26)_50%,transparent_78%)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      <span className="relative">Démarrer gratuitement</span>
      <span aria-hidden className="relative text-base leading-none transition-transform duration-200 group-hover:translate-x-0.5">→</span>
    </Link>
  );
}
