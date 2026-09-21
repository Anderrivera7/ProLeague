"use client";

import Link from "next/link";
import { Plus, LogIn, Calendar, UsersRound } from "lucide-react";

const actions = [
  {
    href: "/crews",
    label: "Amigos",
    fullLabel: "Mis grupos",
    icon: UsersRound,
    color: "bg-primary/15 text-primary",
  },
  {
    href: "/tournaments/create",
    label: "Crear",
    fullLabel: "Crear torneo",
    icon: Plus,
    color: "bg-emerald-500/15 text-emerald-400",
  },
  {
    href: "/tournaments/join",
    label: "Código",
    fullLabel: "Con código",
    icon: LogIn,
    color: "bg-amber-500/15 text-amber-400",
  },
  {
    href: "/matches",
    label: "Partidos",
    fullLabel: "Mis partidos",
    icon: Calendar,
    color: "bg-sky-500/15 text-sky-400",
  },
];

export function QuickActions() {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
        Acciones rápidas
      </h2>
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            prefetch
            className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-2.5 transition-colors hover:border-primary/25 hover:bg-card-hover active:scale-95 sm:p-3"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${action.color}`}
            >
              <action.icon className="h-5 w-5" />
            </div>
            <span className="text-center text-[10px] font-medium leading-tight text-muted-foreground sm:hidden">
              {action.label}
            </span>
            <span className="hidden text-center text-[11px] font-medium leading-tight text-muted-foreground sm:block">
              {action.fullLabel}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
