import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TeamCrest } from "@/components/shared/team-crest";
import { TeamStatsPanel } from "@/features/tournaments/components/team-stats-panel";
import { SquadRosterPanel } from "@/features/tournaments/components/squad-roster-panel";
import { TournamentSquadStats } from "@/features/tournaments/components/tournament-squad-stats";
import { filterActiveSquad } from "@/lib/fc-data/excluded-players";
import type { TournamentFcPlayerStats } from "@/types/tournament-stats";

interface TeamSquadViewProps {
  team: {
    id: string;
    name: string;
    crestUrl: string | null;
    fifaIndexId?: string;
    overall: number | null;
    attack: number | null;
    midfield: number | null;
    defense: number | null;
    league?: { name: string } | null;
    players: Array<{
      id: string;
      fifaIndexId: string;
      name: string;
      position: string | null;
      squadRole: string | null;
      jerseyNumber: number | null;
      overall: number | null;
      potential: number | null;
      imageUrl: string | null;
      pace: number | null;
      shooting: number | null;
      passing: number | null;
      dribbling: number | null;
      defending: number | null;
      physic: number | null;
    }>;
  };
  backHref: string;
  subtitle?: string;
  compactHeader?: boolean;
  tournamentPlayerStats?: TournamentFcPlayerStats[];
}

export function TeamSquadView({
  team,
  backHref,
  subtitle,
  compactHeader = false,
  tournamentPlayerStats,
}: TeamSquadViewProps) {
  const playersForUi = filterActiveSquad(
    team.players.map((p) => ({
      ...p,
      eaId: p.fifaIndexId,
    }))
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-24">
      <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-card">
          <TeamCrest
            name={team.name}
            crestUrl={team.crestUrl}
            fifaIndexId={team.fifaIndexId}
            size={56}
          />
        </div>
        <div className="flex-1">
          {!compactHeader && (
            <h1 className="text-2xl font-bold">{team.name}</h1>
          )}
          <p className="text-sm text-muted-foreground">
            {subtitle ?? team.league?.name ?? "EA SPORTS FC 26"} ·{" "}
            {team.players.length} jugadores
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={backHref}>Volver</Link>
        </Button>
      </div>

      {tournamentPlayerStats !== undefined && (
        <TournamentSquadStats stats={tournamentPlayerStats} />
      )}

      <SquadRosterPanel
        players={playersForUi}
        teamEaId={team.fifaIndexId}
        tournamentPlayerStats={tournamentPlayerStats}
        statsPanel={
          <TeamStatsPanel
            name={team.name}
            overall={team.overall}
            attack={team.attack}
            midfield={team.midfield}
            defense={team.defense}
            leagueName={team.league?.name}
          />
        }
      />
    </div>
  );
}
