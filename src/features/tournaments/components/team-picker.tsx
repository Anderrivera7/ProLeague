"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, CloudDownload, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSearchTeams, useSyncTeamByEaId } from "@/hooks/use-teams";
import { toast } from "sonner";

interface TeamOption {
  id: string;
  name: string;
  crestUrl: string | null;
  overall: number | null;
  attack: number | null;
  midfield: number | null;
  defense: number | null;
  taken?: boolean;
  playerCount?: number;
}

interface TeamPickerProps {
  initialTeams: TeamOption[];
  tournamentId: string;
  leagueId?: string;
  selectedTeamId?: string | null;
  takenTeamIds?: string[];
}

export function TeamPicker({
  initialTeams,
  tournamentId,
  leagueId,
  selectedTeamId,
  takenTeamIds = [],
}: TeamPickerProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const syncRemote = useSyncTeamByEaId();

  const { data, isFetching } = useSearchTeams(search, leagueId, search.length >= 2);

  const takenSet = useMemo(() => new Set(takenTeamIds), [takenTeamIds]);

  const cachedTeams = useMemo(() => {
    if (search.length >= 2 && data?.teams) {
      return data.teams.map((t) => ({
        id: t.id,
        eaId: t.eaId,
        name: t.name,
        crestUrl: t.crestUrl,
        overall: t.overall,
        attack: t.attack,
        midfield: t.midfield,
        defense: t.defense,
        playerCount: t.playerCount,
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
  }, [search, data, initialTeams, takenSet]);

  const remoteTeams = search.length >= 2 ? (data?.remote ?? []) : [];

  async function handleRemoteTeam(eaId: string, name: string) {
    try {
      toast.loading(`Importando ${name} desde EA FC...`, { id: "sync" });
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
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar selección o club..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {isFetching && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Selecciones del Mundial FC26 en cache. Si eliges una sin plantilla, se
        importará desde la API oficial de EA (solo una vez).
      </p>

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
              "flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-all",
              team.taken
                ? "pointer-events-none opacity-50"
                : "hover:border-primary/50 hover:bg-card-hover active:scale-[0.98]",
              selectedTeamId === team.id &&
                "border-primary ring-1 ring-primary/40"
            )}
          >
            <TeamAvatar name={team.name} crestUrl={team.crestUrl} />
            <div className="min-w-0 flex-1">
              <p className="font-semibold truncate">{team.name}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {team.overall != null && (
                  <Badge variant="outline" className="text-[10px]">
                    OVR {team.overall}
                  </Badge>
                )}
                {team.playerCount != null && team.playerCount > 0 && (
                  <Badge variant="secondary" className="text-[10px]">
                    {team.playerCount} jugadores
                  </Badge>
                )}
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
              <TeamAvatar name={team.name} crestUrl={team.crestUrl ?? null} />
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
          <code className="text-primary">npm run seed:fc-teams</code>
        </p>
      )}
    </div>
  );
}

function TeamAvatar({
  name,
  crestUrl,
}: {
  name: string;
  crestUrl: string | null;
}) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted/50">
      {crestUrl ? (
        <Image
          src={crestUrl}
          alt={name}
          width={36}
          height={36}
          className="object-contain"
          unoptimized
        />
      ) : (
        <span className="text-lg">⚽</span>
      )}
    </div>
  );
}
