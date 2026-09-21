"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, UsersRound, Share2, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "proleague-onboarding-dismissed";

type Step = {
  id: string;
  title: string;
  description: string;
  href: string;
  done: boolean;
  icon: typeof Trophy;
};

export function OnboardingChecklist({
  hasCrew,
  crewInviteHref,
  hasTournament,
}: {
  hasCrew: boolean;
  crewInviteHref: string | null;
  hasTournament: boolean;
}) {
  const [dismissed, setDismissed] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      setDismissed(false);
    }
    setReady(true);
  }, []);

  const steps: Step[] = [
    {
      id: "crew",
      title: "Crea o únete a un grupo",
      description: "Amigos para rivalizar en títulos",
      href: "/crews",
      done: hasCrew,
      icon: UsersRound,
    },
    {
      id: "invite",
      title: "Invita a tus amigos",
      description: "Comparte el código o el link del grupo",
      href: crewInviteHref ?? "/crews",
      done: hasCrew,
      icon: Share2,
    },
    {
      id: "tournament",
      title: "Crea o únete a un torneo",
      description: "Tu primera liga o copa con ellos",
      href: hasCrew ? "/tournaments/create" : "/tournaments/join",
      done: hasTournament,
      icon: Trophy,
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;
  const next = steps.find((s) => !s.done);

  if (!ready || dismissed || allDone) return null;

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-card to-background">
      <div className="flex items-start justify-between gap-2 border-b border-white/8 px-4 py-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
            Empieza aquí
          </p>
          <h2 className="text-sm font-semibold">Tu primera rivalidad</h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {doneCount}/{steps.length} pasos listos
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 text-[11px] text-muted-foreground hover:text-foreground"
        >
          Omitir
        </button>
      </div>

      <div className="h-1 w-full bg-white/5">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${(doneCount / steps.length) * 100}%` }}
        />
      </div>

      <ol className="divide-y divide-white/5">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isNext = next?.id === step.id;
          return (
            <li key={step.id}>
              <Link
                href={step.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.03]",
                  step.done && "opacity-55"
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
                    step.done
                      ? "border-primary/40 bg-primary/20 text-primary"
                      : isNext
                        ? "border-primary bg-primary text-primary-foreground shadow-[0_0_16px_rgba(57,255,20,0.25)]"
                        : "border-white/10 bg-white/5 text-muted-foreground"
                  )}
                >
                  {step.done ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {index + 1}. {step.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {step.description}
                  </p>
                </div>
                {!step.done && (
                  <ChevronRight className="h-4 w-4 shrink-0 text-primary" />
                )}
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
