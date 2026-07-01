import Link from "next/link";
import { Badge } from "@/components/ui/badge";
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
  variant?: "active" | "upcoming";
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
}: TournamentSlideProps) {
  const typeLabel = TOURNAMENT_TYPES[type]?.label ?? "Torneo";
  const isActive = variant === "active" || status === "ACTIVE";

  return (
    <Link
      href={`/tournaments/${id}`}
      className={cn(
        "relative flex h-40 min-w-[280px] shrink-0 flex-col justify-end overflow-hidden rounded-2xl border border-border p-4 transition-transform active:scale-[0.98]",
        isActive ? "tournament-card-active" : "tournament-card-upcoming"
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
      <div className="relative z-10 space-y-2">
        <Badge
          variant={isActive ? "default" : "outline"}
          className={cn(
            "text-[10px] uppercase tracking-wider",
            isActive ? "bg-primary text-primary-foreground" : "border-primary/50 text-primary"
          )}
        >
          {isActive ? "En curso" : "Próximo"}
        </Badge>
        <div>
          <h3 className="text-lg font-bold leading-tight">{name}</h3>
          <p className="text-xs text-white/70">
            EA SPORTS FC · {participants}/{maxParticipants} jugadores
          </p>
          <p className="text-xs text-white/50">{typeLabel}</p>
        </div>
        {isActive && roundLabel && (
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-white/60">
              <span>{roundLabel}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
              <div className="h-full w-3/5 rounded-full bg-primary" />
            </div>
          </div>
        )}
        {!isActive && (
          <p className="text-xs font-medium text-primary">Inscripción abierta</p>
        )}
      </div>
    </Link>
  );
}
