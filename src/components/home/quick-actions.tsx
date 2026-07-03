"use client";

import Link from "next/link";
import { Plus, LogIn, Calendar, UserPlus } from "lucide-react";

const actions = [
  {
    href: "/tournaments/create",
    label: "Crear torneo",
    icon: Plus,
    color: "bg-primary/15 text-primary",
  },
  {
    href: "/tournaments/join",
    label: "Unirse",
    icon: LogIn,
    color: "bg-secondary/15 text-secondary",
  },
  {
    href: "/matches",
    label: "Mis partidos",
    icon: Calendar,
    color: "bg-blue-500/15 text-blue-400",
  },
  {
    href: "/players",
    label: "Invitar",
    icon: UserPlus,
    color: "bg-purple-500/15 text-purple-400",
  },
];

export function QuickActions() {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
        Acciones rápidas
      </h2>
      <div className="grid grid-cols-4 gap-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-3 transition-colors hover:bg-card-hover active:scale-95"
          >
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${action.color}`}
            >
              <action.icon className="h-5 w-5" />
            </div>
            <span className="text-center text-[10px] font-medium leading-tight text-muted-foreground">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
