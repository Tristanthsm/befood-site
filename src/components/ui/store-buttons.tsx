import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { storeLinks } from "@/lib/site-config";
import { cn } from "@/lib/utils";

interface StoreButtonsProps {
  className?: string;
  compact?: boolean;
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("h-5 w-5", className)}>
      <path
        fill="currentColor"
        d="M16.69 12.9c.03 3.21 2.82 4.28 2.85 4.29-.02.07-.44 1.53-1.44 3.03-.87 1.3-1.77 2.6-3.2 2.62-1.4.03-1.85-.83-3.46-.83s-2.1.8-3.43.85c-1.38.05-2.43-1.38-3.31-2.67-1.8-2.61-3.17-7.39-1.33-10.59.91-1.58 2.55-2.58 4.34-2.61 1.36-.03 2.64.92 3.46.92.81 0 2.33-1.14 3.93-.97.67.03 2.55.27 3.76 2.04-.1.06-2.24 1.31-2.22 3.92Zm-2.24-6.72c.73-.89 1.22-2.12 1.09-3.35-1.06.04-2.34.71-3.11 1.6-.67.78-1.27 2.03-1.11 3.22 1.18.09 2.4-.6 3.13-1.47Z"
      />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("h-5 w-5", className)}>
      <polygon points="4,3 14,12 4,21" fill="#34A853" />
      <polygon points="14,12 18,8 21,10 17,14" fill="#FBBC05" />
      <polygon points="4,3 17,10 14,12" fill="#4285F4" />
      <polygon points="4,21 14,12 17,14" fill="#EA4335" />
    </svg>
  );
}

function StoreLabel({ top, bottom }: { top: string; bottom: string }) {
  return (
    <span className="flex flex-col items-start leading-tight">
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/70">{top}</span>
      <span className="text-sm font-semibold text-white">{bottom}</span>
    </span>
  );
}

export function StoreButtons({ className, compact = false }: StoreButtonsProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {storeLinks.appStore.status === "live" ? (
        <ButtonLink
          href={storeLinks.appStore.url}
          size={compact ? "md" : "lg"}
          className="min-h-14 min-w-[14.5rem] items-center justify-start gap-2 rounded-2xl border border-[#d9e0e8] bg-white px-5 py-3 text-left shadow-none hover:bg-[#f4f7fa]"
          ariaLabel="Télécharger BeFood sur l'App Store"
        >
          <AppleIcon className="text-[#0b1118]" />
          <span className="flex flex-col items-start leading-tight">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#516173]">Disponible sur</span>
            <span className="text-sm font-semibold text-[#0b1118]">App Store</span>
          </span>
        </ButtonLink>
      ) : (
        <div
          data-store-placeholder
          className="inline-flex min-h-14 min-w-[14.5rem] items-center gap-2 rounded-2xl border border-dashed border-[#d9e0e8] bg-white px-5 py-3 text-sm font-medium text-[#0b1118]/80"
        >
          <AppleIcon className="text-[#0b1118]" />
          <span className="flex flex-col items-start leading-tight">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#516173]">Disponible sur</span>
            <span className="text-sm font-semibold text-[#0b1118]">App Store</span>
          </span>
          <Badge className="ml-1 bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]">Bientôt</Badge>
        </div>
      )}
      {storeLinks.googlePlay.status === "live" ? (
        <ButtonLink
          href={storeLinks.googlePlay.url}
          variant="secondary"
          size={compact ? "md" : "md"}
          className="min-h-12 min-w-[12.5rem] items-center justify-start gap-2 rounded-2xl border border-[#1f2937] bg-[#0b1118] px-4 py-2.5 text-left text-white shadow-none ring-0 hover:bg-[#131c27] hover:text-white"
          ariaLabel="Télécharger BeFood sur Google Play"
        >
          <PlayIcon />
          <StoreLabel top="Disponible sur" bottom="Google Play" />
        </ButtonLink>
      ) : (
        <div
          data-store-placeholder
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[color:rgb(245_249_248)] px-4 py-2 text-sm text-[var(--color-muted)]"
        >
          <PlayIcon className="h-4 w-4" />
          <span className="font-medium text-[var(--color-muted)]">Google Play</span>
          <Badge className="ml-1 border border-[var(--color-border)] bg-transparent text-[var(--color-muted)]">
            Bientôt disponible
          </Badge>
        </div>
      )}
    </div>
  );
}
