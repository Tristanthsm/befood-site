"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

export function HeaderShell({ children }: { children: React.ReactNode }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isCoachSpace = pathname?.startsWith("/espace-coach") ?? false;

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-300",
        isCoachSpace ? (isScrolled ? "py-1.5" : "py-2.5") : isScrolled ? "py-3" : "py-5",
      )}
    >
      <Container>
        <div
          className={cn(
            "mx-auto max-w-6xl transition-all duration-300",
            isCoachSpace
              ? isScrolled
                ? "rounded-xl border border-[color:rgb(11_34_52_/10%)] bg-[color:rgb(250_253_252_/94%)] px-3 py-1.5 shadow-[0_12px_28px_-24px_rgba(14,41,38,0.45)] backdrop-blur-md sm:px-4"
                : "rounded-xl border border-[color:rgb(11_34_52_/8%)] bg-[color:rgb(250_253_252_/90%)] px-3 py-2 backdrop-blur-sm sm:px-4"
              : isScrolled
                ? "rounded-2xl border border-[color:rgb(11_34_52_/10%)] bg-[color:rgb(250_253_252_/92%)] px-4 py-2.5 shadow-[0_16px_34px_-28px_rgba(14,41,38,0.55)] backdrop-blur-md sm:px-5"
                : "px-1 py-0 sm:px-2",
          )}
        >
          {children}
        </div>
      </Container>
    </header>
  );
}
