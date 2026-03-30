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
        d="M16.6 12.7c0-2.2 1.8-3.3 1.9-3.4-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.8-3.5.8-.8 0-1.9-.8-3.1-.8-1.6 0-3.1.9-3.9 2.3-1.7 2.9-.4 7.2 1.2 9.5.8 1.1 1.7 2.4 2.9 2.3 1.1 0 1.6-.7 3-.7 1.4 0 1.8.7 3 .7 1.3 0 2-.9 2.8-2.1.9-1.3 1.2-2.6 1.3-2.6-.1 0-2.2-.8-2.2-4.2ZM14.2 6c.6-.8 1-1.9.9-3-.9 0-2 .6-2.6 1.4-.6.7-1.1 1.9-1 3 1 .1 2-.5 2.7-1.4Z"
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

export function StoreButtons({ className, compact = false }: StoreButtonsProps) {
  const baseTileClass =
    "h-14 w-[17.5rem] items-center justify-between rounded-full border border-[#d9e0e8] bg-white px-4 text-left shadow-none";
  const badgeClass =
    "h-7 shrink-0 rounded-full border border-[var(--color-border)] bg-transparent px-3 text-[11px] font-semibold text-[var(--color-muted)]";
  const leftGroupClass = "flex items-center gap-2";
  const labelClass = "flex flex-col items-start leading-tight";
  const topTextClass = "text-[10px] font-semibold uppercase tracking-[0.12em] text-[#516173]";
  const bottomTextClass = "text-sm font-semibold text-[#0b1118]";

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {storeLinks.appStore.status === "live" ? (
        <ButtonLink
          href={storeLinks.appStore.url}
          size={compact ? "md" : "lg"}
          className={cn(baseTileClass, "hover:bg-[#f4f7fa]")}
          ariaLabel="Télécharger BeFood sur l'App Store"
        >
          <span className={leftGroupClass}>
            <AppleIcon className="text-[#0b1118]" />
            <span className={labelClass}>
              <span className={topTextClass}>Disponible sur</span>
              <span className={bottomTextClass}>App Store</span>
            </span>
          </span>
          <Badge className={badgeClass}>Disponible</Badge>
        </ButtonLink>
      ) : (
        <div
          data-store-placeholder
          className={cn("inline-flex", baseTileClass)}
        >
          <span className={leftGroupClass}>
            <AppleIcon className="text-[#0b1118]" />
            <span className={labelClass}>
              <span className={topTextClass}>Disponible sur</span>
              <span className={bottomTextClass}>App Store</span>
            </span>
          </span>
          <Badge className={badgeClass}>Pas encore disponible</Badge>
        </div>
      )}
      {storeLinks.googlePlay.status === "live" ? (
        <ButtonLink
          href={storeLinks.googlePlay.url}
          size={compact ? "md" : "lg"}
          className={cn(baseTileClass, "hover:bg-[#f4f7fa]")}
          ariaLabel="Télécharger BeFood sur Google Play"
        >
          <span className={leftGroupClass}>
            <PlayIcon className="text-[#0b1118]" />
            <span className={labelClass}>
              <span className={topTextClass}>Disponible sur</span>
              <span className={bottomTextClass}>Google Play</span>
            </span>
          </span>
          <Badge className={badgeClass}>Disponible</Badge>
        </ButtonLink>
      ) : (
        <div
          data-store-placeholder
          className={cn("inline-flex", baseTileClass)}
        >
          <span className={leftGroupClass}>
            <PlayIcon className="text-[#0b1118]" />
            <span className={labelClass}>
              <span className={topTextClass}>Disponible sur</span>
              <span className={bottomTextClass}>Google Play</span>
            </span>
          </span>
          <Badge className={badgeClass}>Pas encore disponible</Badge>
        </div>
      )}
    </div>
  );
}
