import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TeamStatsPanel } from "@/features/tournaments/components/team-stats-panel";
import { SquadFormationPitch } from "@/features/tournaments/components/squad-formation-pitch";
import { PlayerStatsRow } from "@/features/tournaments/components/player-stats-row";
import { isStarterRole } from "@/lib/fc-data/formation";

interface TeamSquadViewProps {
  team: {
    id: string;
    name: string;
    crestUrl: string | null;
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
}

export function TeamSquadView({ team, backHref, subtitle }: TeamSquadViewProps) {
  const starters = team.players.filter((p) => isStarterRole(p.squadRole));
  const bench = team.players.filter((p) => !isStarterRole(p.squadRole));
  const playersForUi = team.players.map((p) => ({
    ...p,
    eaId: p.fifaIndexId,
  }));

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-24">
      <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-card">
          {team.crestUrl ? (
            <Image
              src={team.crestUrl}
              alt={team.name}
              width={56}
              height={56}
              className="object-contain"
              unoptimized
            />
          ) : (
            <span className="text-3xl">⚽</span>
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{team.name}</h1>
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

      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            Titulares
            <Badge variant="secondary">{starters.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {starters.map((player) => (
            <PlayerStatsRow
              key={player.id}
              player={{ ...player, eaId: player.fifaIndexId }}
            />
          ))}
        </CardContent>
      </Card>

      {bench.length > 0 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              Suplentes y reservas
              <Badge variant="outline">{bench.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {bench.map((player) => (
              <PlayerStatsRow
                key={player.id}
                player={{ ...player, eaId: player.fifaIndexId }}
                compact
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
