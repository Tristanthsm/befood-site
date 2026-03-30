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
      <g fill="currentColor">
        <path d="M18.546 12.763c.024-1.87 1.004-3.597 2.597-4.576-1.009-1.442-2.64-2.323-4.399-2.378-1.851-.194-3.645 1.107-4.588 1.107-.961 0-2.413-1.088-3.977-1.056-2.057.067-3.929 1.208-4.93 3.007-2.131 3.69-.542 9.114 1.5 12.097 1.022 1.461 2.215 3.092 3.778 3.035 1.529-.063 2.1-.975 3.945-.975 1.828 0 2.364.975 3.958.938 1.64-.027 2.674-1.467 3.66-2.942a14.74 14.74 0 0 0 1.673-3.408c-1.948-.824-3.215-2.733-3.217-4.849Z" />
        <path d="M15.535 3.847C16.429 2.773 16.87 1.393 16.763 0c-1.366.144-2.629.797-3.535 1.829-.895 1.019-1.349 2.351-1.261 3.705 1.385.014 2.7-.608 3.568-1.687Z" />
      </g>
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
    "h-15 w-[18.25rem] items-center justify-between rounded-full border border-[#d9e0e8] bg-white px-5 text-left shadow-none";
  const badgeClass =
    "h-7 shrink-0 rounded-full border border-[var(--color-border)] bg-transparent px-3 text-[11px] font-semibold text-[var(--color-muted)]";
  const leftGroupClass = "flex items-center gap-3.5";
  const leftGroupEdgeClass = "flex items-center gap-3.5 -ml-1.5";
  const labelClass = "flex flex-col items-start leading-tight";
  const topTextClass = "text-[10px] font-semibold uppercase tracking-[0.12em] text-[#516173]";
  const bottomTextClass = "text-sm font-semibold text-[#0b1118]";

  return (
    <div className={cn("flex flex-wrap items-center gap-4", className)}>
      {storeLinks.appStore.status === "live" ? (
        <ButtonLink
          href={storeLinks.appStore.url}
          variant="ghost"
          size={compact ? "md" : "lg"}
          trackingId="download_app_store"
          trackingLocation={compact ? "hero_or_cta_compact" : "store_buttons"}
          className={cn(
            baseTileClass,
            "bg-white text-[#0b1118] ring-0 hover:bg-[#f4f7fa] hover:text-[#0b1118]",
          )}
          ariaLabel="Télécharger BeFood sur l'App Store"
        >
          <span className={leftGroupEdgeClass}>
            <AppleIcon className="h-[1.65rem] w-[1.65rem] text-[#0b1118]" />
            <span className={labelClass}>
              <span className={topTextClass}>Disponible sur</span>
              <span className={bottomTextClass}>App Store</span>
            </span>
          </span>
          <span className="ml-auto mr-[-6px]">
            <Badge
              className={cn(
                badgeClass,
                "h-10 w-10 px-0 flex items-center justify-center border-[#0ea875] bg-[#dcf7ec] shadow-[0_8px_18px_-12px_rgba(16,185,129,0.85)]",
              )}
            >
              <span aria-hidden className="text-xl font-bold leading-none text-[#0f7f5a]">
                ↗
              </span>
            </Badge>
          </span>
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
          trackingId="download_google_play"
          trackingLocation={compact ? "hero_or_cta_compact" : "store_buttons"}
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
          className={cn("inline-flex", baseTileClass, "border-[#c7d0da] bg-[#e3e8ee]")}
        >
          <span className={cn(leftGroupClass, "opacity-70")}>
            <PlayIcon className="h-6 w-6 grayscale" />
            <span className={labelClass}>
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#707f90]">Disponible sur</span>
              <span className="text-sm font-semibold text-[#49586a]">Google Play</span>
            </span>
          </span>
          <Badge className={cn(badgeClass, "border-[#b9c4d0] bg-[#dde3ea] text-[#667689]")}>Bientôt</Badge>
        </div>
      )}
    </div>
  );
}
