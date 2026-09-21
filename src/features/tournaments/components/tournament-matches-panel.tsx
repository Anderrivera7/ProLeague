import { MatchCard } from "@/features/matches/components/match-card";

type MatchRow = {
  id: string;
  leg: number;
  round: number;
  homeParticipant: { userId: string };
  awayParticipant: { userId: string };
};

interface TournamentMatchesPanelProps {
  tournamentId: string;
  tournamentName: string;
  twoLegs: boolean;
  matches: MatchRow[];
  currentUserId?: string;
  isCreator: boolean;
}

export function TournamentMatchesPanel({
  tournamentId,
  tournamentName,
  twoLegs,
  matches,
  currentUserId,
  isCreator,
}: TournamentMatchesPanelProps) {
  const sorted = [...matches].sort((a, b) => {
    if (a.leg !== b.leg) return a.leg - b.leg;
    if (a.round !== b.round) return a.round - b.round;
    return a.id.localeCompare(b.id);
  });

  const ida = sorted.filter((m) => m.leg !== 2);
  const vuelta = sorted.filter((m) => m.leg === 2);

  function canReport(match: MatchRow) {
    return (
      isCreator ||
      match.homeParticipant.userId === currentUserId ||
      match.awayParticipant.userId === currentUserId
    );
  }

  if (sorted.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
        {isCreator
          ? "Genera el fixture para crear los partidos"
          : "El organizador aún no ha generado el fixture"}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Partidos</h2>
        <span className="text-xs font-medium text-primary">
          {twoLegs
            ? `Ida y vuelta · ${ida.length} ida · ${vuelta.length} vuelta`
            : `${sorted.length} partidos`}
        </span>
      </div>

      <section className="space-y-3">
        {twoLegs && (
          <h3 className="text-sm font-semibold text-primary">
            Ida · {ida.length} partidos
          </h3>
        )}
        {ida.map((match) => (
          <MatchCard
            key={match.id}
            match={match as never}
            tournament={{ id: tournamentId, name: tournamentName }}
            canReport={canReport(match)}
          />
        ))}
      </section>

      {twoLegs && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-primary">
            Vuelta · {vuelta.length} partidos
          </h3>
          {vuelta.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aún no hay partidos de vuelta.
            </p>
          ) : (
            vuelta.map((match) => (
              <MatchCard
                key={match.id}
                match={match as never}
                tournament={{ id: tournamentId, name: tournamentName }}
                canReport={canReport(match)}
              />
            ))
          )}
        </section>
      )}
    </div>
  );
}
