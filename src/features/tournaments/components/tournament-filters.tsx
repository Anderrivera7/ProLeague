"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

const FILTERS = [
  { id: "mine", label: "Mis torneos", href: "/tournaments" },
  { id: "join", label: "Con código", href: "/tournaments/join" },
] as const;

export function TournamentFilters({
  active = "mine",
}: {
  active?: (typeof FILTERS)[number]["id"];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((filter) => (
        <Link
          key={filter.id}
          href={filter.href}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            active === filter.id
              ? "border-primary/40 bg-primary/15 text-primary"
              : "border-border bg-card text-muted-foreground hover:border-primary/25 hover:text-foreground"
          )}
        >
          {filter.label}
        </Link>
      ))}
    </div>
  );
}
