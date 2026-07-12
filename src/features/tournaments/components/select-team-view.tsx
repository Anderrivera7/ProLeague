"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { TeamCrest } from "@/components/shared/team-crest";
import { Button } from "@/components/ui/button";
import { selectTournamentTeam } from "@/actions/tournament-actions";
import { TeamStatsPanel } from "@/features/tournaments/components/team-stats-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SquadCountBadges } from "@/components/shared/squad-count-badges";
import { useSyncTeamById } from "@/hooks/use-teams";
import type { SerializedTeam } from "@/server-actions/team-actions";
import {
  isStarterRole,
  isSubstituteRole,
} from "@/lib/fc-data/formation";

interface SelectTeamViewProps {
  tournamentId: string;
  teamId: string;
  teamName: string;
  isTaken: boolean;
  initialTeam?: SerializedTeam;
  syncSource?: "cache" | "csv" | "ea-api";
}

export function SelectTeamView({
  tournamentId,
  teamId,
  teamName,
  isTaken,
  initialTeam,
  syncSource: initialSource,
}: SelectTeamViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const shouldSync = !initialTeam;
  const { data, isLoading, error, isFetching } = useSyncTeamById(teamId, shouldSync);

  const team = initialTeam ?? data?.team;
  const source = initialSource ?? data?.source;
  const starters = team?.players.filter((p) => isStarterRole(p.squadRole)) ?? [];
  const substitutes =
    team?.players.filter((p) => isSubstituteRole(p.squadRole)) ?? [];

  function renderPlayerList(
    players: NonNullable<typeof team>["players"],
    title: string
  ) {
    if (players.length === 0) return null;
    return (
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title} ({players.length})
        </p>
        {players.map((player) => (
          <div
            key={player.id}
            className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                {player.jerseyNumber ?? player.position?.slice(0, 2) ?? "—"}
              </div>
              <div className="min-w-0">
                <span className="block truncate text-sm font-medium">
                  {player.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {player.squadRole ?? player.position}
                  {player.pace != null && ` · PAC ${player.pace}`}
                </span>
              </div>
            </div>
            {player.overall != null && (
              <Badge variant="outline">{player.overall}</Badge>
            )}
          </div>
        ))}
      </div>
    );
  }

  function handleSelect() {
    if (!team) return;
    startTransition(async () => {
      const result = await selectTournamentTeam(tournamentId, team.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`¡${team.name} es tu equipo!`);
        router.push(`/tournaments/${tournamentId}`);
      }
    });
  }

  if (shouldSync && (isLoading || isFetching)) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Sincronizando {teamName}...
        </p>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "No se pudo cargar el equipo"}
        </p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href={`/tournaments/${tournamentId}/select-team`}>Volver</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {(source === "csv" || source === "cache") && (
        <p className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-center text-xs text-primary">
          Plantilla FC26 desde CSV (formaciones nation_position) · cache permanente
        </p>
      )}

      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-border bg-card">
          <TeamCrest
            name={team.name}
            crestUrl={team.crestUrl}
            fifaIndexId={team.fifaIndexId}
            size={72}
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{team.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {team.league?.name ?? "EA SPORTS FC"}
          </p>
          {starters.length + substitutes.length > 0 && (
            <div className="mt-2 flex justify-center">
              <SquadCountBadges
                counts={{
                  total: team.players.length,
                  starters: starters.length,
                  substitutes: substitutes.length,
                  reserves: 0,
                }}
              />
            </div>
          )}
        </div>
      </div>

      <TeamStatsPanel
        name={team.name}
        overall={team.overall}
        attack={team.attack}
        midfield={team.midfield}
        defense={team.defense}
        leagueName={team.league?.name}
      />

      {team.players.length > 0 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-base">
              Plantilla ({team.players.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 space-y-4 overflow-y-auto">
            {renderPlayerList(starters, "Titulares")}
            {renderPlayerList(substitutes, "Suplentes")}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" asChild>
          <Link href={`/tournaments/${tournamentId}/select-team`}>Volver</Link>
        </Button>
        <Button
          className="flex-1"
          disabled={isPending || isTaken}
          onClick={handleSelect}
        >
          {isTaken
            ? "Equipo ocupado"
            : isPending
              ? "Guardando..."
              : "Seleccionar equipo"}
        </Button>
      </div>
    </div>
  );
}
