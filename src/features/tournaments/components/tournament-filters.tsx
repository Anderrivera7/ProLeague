import Link from "next/link";
import { cn } from "@/lib/utils";

const FILTERS = [
  { id: "all", label: "Todos", href: "/tournaments" },
  { id: "open", label: "Abiertos", href: "/tournaments?filter=open" },
  { id: "mine", label: "Míos", href: "/tournaments?filter=mine" },
] as const;

export function TournamentFilters({
  active,
}: {
  active: "all" | "open" | "mine";
}) {
  return (
    <div className="flex gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {FILTERS.map((filter) => {
        const isActive = filter.id === active;
        return (
          <Link
            key={filter.id}
            href={filter.href}
            prefetch
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors sm:text-sm",
              isActive
                ? "border-primary/40 bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            {filter.label}
          </Link>
        );
      })}
    </div>
  );
}
