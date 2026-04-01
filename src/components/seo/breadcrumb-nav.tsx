import Link from "next/link";

interface BreadcrumbItem {
  name: string;
  path: string;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbNav({ items }: BreadcrumbNavProps) {
  if (items.length < 2) {
    return null;
  }

  return (
    <nav aria-label="Fil d'ariane" className="text-sm text-[var(--color-muted)]">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.path} className="inline-flex items-center gap-2">
              {isLast ? (
                <span aria-current="page" className="font-medium text-[var(--color-ink)]">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.path}
                  className="underline-offset-4 hover:text-[var(--color-ink)] hover:underline"
                >
                  {item.name}
                </Link>
              )}
              {!isLast ? <span aria-hidden>›</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
