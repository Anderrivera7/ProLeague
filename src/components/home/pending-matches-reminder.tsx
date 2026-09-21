import Link from "next/link";
import { AlertCircle, ChevronRight, Swords } from "lucide-react";
import { cn } from "@/lib/utils";

export type PendingReminder = {
  id: string;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  proposedByUserId: string | null;
  tournamentName: string;
  homeNickname: string;
  awayNickname: string;
  needsConfirm: boolean;
};

export function PendingMatchesReminder({
  matches,
}: {
  matches: PendingReminder[];
}) {
  if (matches.length === 0) return null;

  const confirmCount = matches.filter((m) => m.needsConfirm).length;

  return (
    <section className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-400/90">
            Te toca jugar
          </p>
          <h2 className="text-sm font-semibold">
            Partidos pendientes
            {confirmCount > 0 && (
              <span className="ml-2 text-xs font-medium text-amber-400">
                · {confirmCount} por confirmar
              </span>
            )}
          </h2>
        </div>
        <Link
          href="/matches"
          className="flex items-center gap-0.5 text-xs text-primary"
        >
          Ver todos
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="space-y-2">
        {matches.map((m) => (
          <Link
            key={m.id}
            href={`/matches/${m.id}`}
            className={cn(
              "flex items-center gap-3 rounded-2xl border px-3 py-3 transition-colors active:scale-[0.99]",
              m.needsConfirm
                ? "border-amber-500/40 bg-amber-500/10"
                : "border-white/10 bg-card hover:border-primary/30"
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                m.needsConfirm
                  ? "bg-amber-500/20 text-amber-300"
                  : "bg-sky-500/15 text-sky-400"
              )}
            >
              {m.needsConfirm ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <Swords className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {m.homeNickname} vs {m.awayNickname}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {m.tournamentName}
                {m.needsConfirm ? " · Confirma el resultado" : " · Programado"}
              </p>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                m.needsConfirm
                  ? "bg-amber-500 text-black"
                  : "bg-primary/15 text-primary"
              )}
            >
              {m.needsConfirm ? "Confirmar" : "Abrir"}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
