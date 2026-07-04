import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TeamCrest } from "@/components/shared/team-crest";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TeamStatsPanel } from "@/features/tournaments/components/team-stats-panel";
import { SquadFormationPitch } from "@/features/tournaments/components/squad-formation-pitch";
import { PlayerStatsRow } from "@/features/tournaments/components/player-stats-row";
import { TournamentSquadStats } from "@/features/tournaments/components/tournament-squad-stats";
import type { TournamentFcPlayerStats } from "@/types/tournament-stats";
import {
  isReserveRole,
  isStarterRole,
  isSubstituteRole,
} from "@/lib/fc-data/formation";

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
  const statsByPlayer = new Map(
    (tournamentPlayerStats ?? []).map((s) => [s.fcPlayerId, s])
  );
  const starters = team.players.filter((p) => isStarterRole(p.squadRole));
  const substitutes = team.players.filter((p) => isSubstituteRole(p.squadRole));
  const reserves = team.players.filter((p) => isReserveRole(p.squadRole));
  const playersForUi = team.players.map((p) => ({
    ...p,
    eaId: p.fifaIndexId,
  }));

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

      <div className="grid gap-6 lg:grid-cols-2">
        <TeamStatsPanel
          name={team.name}
          overall={team.overall}
          attack={team.attack}
          midfield={team.midfield}
          defense={team.defense}
          leagueName={team.league?.name}
        />
        <SquadFormationPitch players={playersForUi} />
      </div>

      {tournamentPlayerStats !== undefined && (
        <TournamentSquadStats stats={tournamentPlayerStats} />
      )}

      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            Titulares
            <Badge variant="secondary">{starters.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {starters.map((player) => {
            const ms = statsByPlayer.get(player.id);
            return (
            <PlayerStatsRow
              key={player.id}
              player={{ ...player, eaId: player.fifaIndexId }}
              matchStats={
                ms
                  ? {
                      goals: ms.goals,
                      yellowCards: ms.yellowCards,
                      redCards: ms.redCards,
                    }
                  : undefined
              }
            />
            );
          })}
        </CardContent>
      </Card>

      {substitutes.length > 0 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              Suplentes
              <Badge variant="outline">{substitutes.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {substitutes.map((player) => {
              const ms = statsByPlayer.get(player.id);
              return (
                <PlayerStatsRow
                  key={player.id}
                  player={{ ...player, eaId: player.fifaIndexId }}
                  compact
                  matchStats={
                    ms
                      ? {
                          goals: ms.goals,
                          yellowCards: ms.yellowCards,
                          redCards: ms.redCards,
                        }
                      : undefined
                  }
                />
              );
            })}
          </CardContent>
        </Card>
      )}

      {reserves.length > 0 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              Reservas
              <Badge variant="outline">{reserves.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {reserves.map((player) => {
              const ms = statsByPlayer.get(player.id);
              return (
                <PlayerStatsRow
                  key={player.id}
                  player={{ ...player, eaId: player.fifaIndexId }}
                  compact
                  matchStats={
                    ms
                      ? {
                          goals: ms.goals,
                          yellowCards: ms.yellowCards,
                          redCards: ms.redCards,
                        }
                      : undefined
                  }
                />
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
