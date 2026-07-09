"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, CloudDownload, Loader2, ChevronRight } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LeagueCover } from "@/components/shared/league-cover";
import { SquadCountBadges } from "@/components/shared/squad-count-badges";
import { TeamCrest } from "@/components/shared/team-crest";
import { cn } from "@/lib/utils";
import type { SquadCounts } from "@/lib/fc-data/squad-count-types";
import { INTL_LEAGUE_EA_ID } from "@/lib/fc-data/club-ids";
import { useSearchTeams, useSyncTeamByEaId } from "@/hooks/use-teams";
import { toast } from "sonner";

interface TeamOption {
  id: string;
  name: string;
  crestUrl: string | null;
  fifaIndexId?: string;
  overall: number | null;
  attack: number | null;
  midfield: number | null;
  defense: number | null;
  taken?: boolean;
  playerCount?: number;
  squadCounts?: SquadCounts | null;
}

interface TeamPickerProps {
  initialTeams: TeamOption[];
  tournamentId: string;
  tournamentName?: string;
  leagueId?: string;
  leagueName?: string;
  leagueFifaIndexId?: string;
  coverUrl?: string | null;
  selectedTeamId?: string | null;
  takenTeamIds?: string[];
}

export function TeamPicker({
  initialTeams,
  tournamentId,
  tournamentName,
  leagueId,
  leagueName,
  leagueFifaIndexId,
  coverUrl,
  selectedTeamId,
  takenTeamIds = [],
}: TeamPickerProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const syncRemote = useSyncTeamByEaId();

  const { data, isFetching } = useSearchTeams(
    deferredSearch,
    leagueId,
    deferredSearch.length >= 2
  );

  const takenSet = useMemo(() => new Set(takenTeamIds), [takenTeamIds]);

  const cachedTeams = useMemo(() => {
    if (deferredSearch.length >= 2 && data?.teams) {
      return data.teams.map((t) => ({
        id: t.id,
        eaId: t.eaId,
        name: t.name,
        crestUrl: t.crestUrl,
        fifaIndexId: t.eaId,
        overall: t.overall,
        attack: t.attack,
        midfield: t.midfield,
        defense: t.defense,
        playerCount: t.playerCount,
        squadCounts: t.squadCounts ?? null,
        taken: takenSet.has(t.id),
        source: "cache" as const,
      }));
    }
    return initialTeams
      .filter((t) => {
        const q = search.toLowerCase().trim();
        if (!q) return true;
        return t.name.toLowerCase().includes(q);
      })
      .map((t) => ({
        ...t,
        eaId: undefined,
        taken: takenSet.has(t.id) || Boolean(t.taken),
        source: "cache" as const,
      }));
  }, [deferredSearch, data, initialTeams, takenSet, search]);

  const remoteTeams = deferredSearch.length >= 2 ? (data?.remote ?? []) : [];
  const isClubLeague =
    leagueFifaIndexId &&
    leagueFifaIndexId !== INTL_LEAGUE_EA_ID;

  async function handleRemoteTeam(eaId: string, name: string) {
    try {
      toast.loading(`Importando ${name} desde CSV FC26...`, { id: "sync" });
      const result = await syncRemote.mutateAsync(eaId);
      toast.success(
        `${name} importado (${result.playersSynced} jugadores)`,
        { id: "sync" }
      );
      router.push(`/tournaments/${tournamentId}/teams/${result.team.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al importar", {
        id: "sync",
      });
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {coverUrl && (
        <div className="relative overflow-hidden rounded-2xl border border-border">
          <div className="relative h-36 sm:h-44">
            <LeagueCover
              coverUrl={coverUrl}
              alt={leagueName ?? tournamentName ?? "Competición"}
              overlayClassName="from-background via-background/40 to-transparent"
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-primary">
                {tournamentName}
              </p>
              <h2 className="text-xl font-bold sm:text-2xl">
                {leagueName ?? "Elige tu equipo"}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {cachedTeams.length} equipos · plantilla completa (titulares y suplentes)
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar club o selección..."
          className="h-11 pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {isFetching && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {!isClubLeague && (
        <p className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          Selecciones del Mundial FC26. Si eliges una sin plantilla en caché, se
          importará desde el CSV FC26 (solo una vez).
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {cachedTeams.map((team) => (
          <Link
            key={team.id}
            href={
              team.taken
                ? "#"
                : `/tournaments/${tournamentId}/teams/${team.id}`
            }
            className={cn(
              "group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all",
              team.taken
                ? "pointer-events-none opacity-50"
                : "hover:border-primary/50 hover:bg-card-hover hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98]",
              selectedTeamId === team.id &&
                "border-primary ring-1 ring-primary/40"
            )}
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-muted/50 ring-1 ring-border/50 transition-transform group-hover:scale-105">
              <TeamCrest
                name={team.name}
                crestUrl={team.crestUrl}
                fifaIndexId={team.fifaIndexId ?? team.eaId}
                size={40}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold leading-tight truncate">{team.name}</p>
                {!team.taken && (
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                )}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {team.overall != null && (
                  <Badge className="text-[10px] font-bold">
                    OVR {team.overall}
                  </Badge>
                )}
                {team.squadCounts ? (
                  <SquadCountBadges counts={team.squadCounts} />
                ) : team.playerCount != null && team.playerCount > 0 ? (
                  <Badge variant="secondary" className="text-[10px]">
                    {team.playerCount} jugadores
                  </Badge>
                ) : null}
                {team.taken && (
                  <Badge variant="secondary" className="text-[10px]">
                    Ocupado
                  </Badge>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {remoteTeams.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Importar selección (API EA)
          </p>
          {remoteTeams.map((team) => (
            <Button
              key={team.eaId}
              variant="outline"
              className="h-auto w-full justify-start gap-3 py-3"
              disabled={syncRemote.isPending}
              onClick={() => handleRemoteTeam(team.eaId, team.name)}
            >
              <CloudDownload className="h-4 w-4 shrink-0 text-primary" />
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                <TeamCrest
                  name={team.name}
                  crestUrl={team.crestUrl ?? null}
                  fifaIndexId={team.eaId}
                  size={28}
                />
              </div>
              <div className="text-left">
                <p className="font-medium">{team.name}</p>
                <p className="text-xs text-muted-foreground">
                  EA ID {team.eaId}
                  {team.overall != null ? ` · OVR ${team.overall}` : ""}
                </p>
              </div>
            </Button>
          ))}
        </div>
      )}

      {cachedTeams.length === 0 && remoteTeams.length === 0 && !isFetching && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No hay equipos. Prueba otra búsqueda o ejecuta{" "}
          <code className="text-primary">npm run seed:fc-clubs</code>
        </p>
      )}
    </div>
  );
}
