import Link from "next/link";

type AdminNavKey = "dashboard" | "requests" | "contracts";

interface AdminNavigationProps {
  active: AdminNavKey;
}

function buttonClass(isActive: boolean): string {
  if (isActive) {
    return "rounded-full bg-[var(--color-ink)] px-4 py-2 text-sm font-semibold text-white";
  }
  return "rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-panel)]";
}

export function AdminNavigation({ active }: AdminNavigationProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link href="/admin" className={buttonClass(active === "dashboard")}>
        Vue globale
      </Link>
      <Link href="/admin/coachs" className={buttonClass(active === "requests")}>
        Validation coachs
      </Link>
      <Link href="/admin/contrats" className={buttonClass(active === "contracts")}>
        Contrats coachs
      </Link>
    </div>
  );
}
