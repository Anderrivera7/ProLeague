import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { LeagueCover } from "@/components/shared/league-cover";
import { TOURNAMENT_TYPES } from "@/constants";
import { cn } from "@/lib/utils";

interface TournamentSlideProps {
  id: string;
  name: string;
  type: keyof typeof TOURNAMENT_TYPES;
  participants: number;
  maxParticipants: number;
  status: "ACTIVE" | "REGISTRATION" | "DRAFT" | "COMPLETED" | "CANCELLED";
  roundLabel?: string;
  variant?: "active" | "upcoming" | "completed";
  coverUrl?: string | null;
  leagueName?: string;
}

export function TournamentSlide({
  id,
  name,
  type,
  participants,
  maxParticipants,
  status,
  roundLabel,
  variant = "active",
  coverUrl,
  leagueName,
}: TournamentSlideProps) {
  const typeLabel = TOURNAMENT_TYPES[type]?.label ?? "Torneo";
  const isActive = variant === "active" || status === "ACTIVE";
  const isCompleted = variant === "completed" || status === "COMPLETED";
  const hasCover = !!coverUrl;

  const badgeLabel = isCompleted
    ? "Finalizado"
    : isActive
      ? "En curso"
      : "Próximo";

  return (
    <Link
      href={`/tournaments/${id}`}
      className={cn(
        "relative flex h-36 min-w-[min(85vw,280px)] shrink-0 flex-col justify-end overflow-hidden rounded-2xl border border-border p-3 transition-transform active:scale-[0.98] sm:h-40 sm:min-w-[280px] sm:p-4",
        !hasCover &&
          (isCompleted
            ? "bg-gradient-to-br from-amber-500/20 via-card to-background"
            : isActive
              ? "tournament-card-active"
              : "tournament-card-upcoming")
      )}
    >
      <LeagueCover coverUrl={coverUrl ?? null} alt={leagueName ?? name} />
      {!hasCover && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
      )}
      <div className="relative z-10 space-y-2">
        <Badge
          variant={isActive && !isCompleted ? "default" : "outline"}
          className={cn(
            "text-[10px] uppercase tracking-wider",
            isCompleted
              ? "border-amber-400/60 text-amber-300"
              : isActive
                ? "bg-primary text-primary-foreground"
                : "border-primary/50 text-primary"
          )}
        >
          {badgeLabel}
        </Badge>
        <div>
          <h3 className="text-lg font-bold leading-tight">{name}</h3>
          <p className="text-xs text-white/70">
            EA SPORTS FC · {participants}/{maxParticipants} jugadores
          </p>
          <p className="text-xs text-white/50">{typeLabel}</p>
        </div>
        {isActive && !isCompleted && roundLabel && (
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-white/60">
              <span>{roundLabel}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
              <div className="h-full w-3/5 rounded-full bg-primary" />
            </div>
          </div>
        )}
        {isCompleted && (
          <p className="text-xs font-medium text-amber-300">Ver campeón</p>
        )}
        {!isActive && !isCompleted && (
          <p className="text-xs font-medium text-primary">Inscripción abierta</p>
        )}
      </div>
    </Link>
  );
}
