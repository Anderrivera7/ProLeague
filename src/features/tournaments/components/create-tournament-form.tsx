"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { toast } from "sonner";
import { LeagueLogo } from "@/components/shared/league-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTournament } from "@/actions/tournament-actions";
import { TOURNAMENT_TYPES } from "@/constants";
import {
  getLeagueCoverUrl,
  getLeagueIconUrl,
  getLeagueSubtitle,
  UCL_LEAGUE_EA_ID,
  INTL_LEAGUE_EA_ID,
} from "@/lib/fc-data/club-ids";
import { cn } from "@/lib/utils";

interface LeagueOption {
  id: string;
  name: string;
  logoUrl: string | null;
  fifaIndexId: string;
  _count: { teams: number };
}

interface CreateTournamentFormProps {
  leagues: LeagueOption[];
}

export function CreateTournamentForm({ leagues }: CreateTournamentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedLeagueId, setSelectedLeagueId] = useState(
    leagues[0]?.id ?? ""
  );

  const selectedLeague = leagues.find((l) => l.id === selectedLeagueId);
  const coverUrl = selectedLeague
    ? getLeagueCoverUrl(selectedLeague.fifaIndexId, selectedLeague.name)
    : null;

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createTournament(formData);
      if (result.error) {
        toast.error(result.error);
      } else if (result.tournamentId) {
        toast.success("¡Torneo creado!");
        router.push(
          `/tournaments/${result.tournamentId}/created?code=${result.joinCode ?? ""}`
        );
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          name="name"
          placeholder="Mundial ProLeague 2026"
          required
          minLength={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Input
          id="description"
          name="description"
          placeholder="Descripción opcional"
        />
      </div>

      <div className="space-y-3">
        <Label>Competición (equipos EA FC)</Label>
        {coverUrl && selectedLeague && (
          <div className="relative overflow-hidden rounded-xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverUrl}
              alt={selectedLeague.name}
              className="aspect-[21/9] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-lg font-bold text-foreground drop-shadow-sm">
                {selectedLeague.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedLeague._count.teams} equipos disponibles
              </p>
            </div>
          </div>
        )}
        {leagues.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Sin ligas — ejecuta{" "}
            <code className="rounded bg-muted px-1">npm run seed:fc-teams</code>,{" "}
            <code className="rounded bg-muted px-1">npm run seed:fc-clubs</code> o{" "}
            <code className="rounded bg-muted px-1">npm run seed:fc-ucl</code>
          </p>
        ) : (
          <>
            <input type="hidden" name="fcLeagueId" value={selectedLeagueId} />
            <div className="grid max-h-64 gap-2 overflow-y-auto rounded-lg border border-border p-2 sm:grid-cols-2">
              {leagues.map((league) => {
                const selected = league.id === selectedLeagueId;
                const isUcl = league.fifaIndexId === UCL_LEAGUE_EA_ID;
                const isHeroIcon =
                  isUcl ||
                  league.fifaIndexId === INTL_LEAGUE_EA_ID;
                const iconUrl = getLeagueIconUrl(
                  league.fifaIndexId,
                  league.name
                );
                return (
                  <button
                    key={league.id}
                    type="button"
                    onClick={() => setSelectedLeagueId(league.id)}
                    className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                      selected
                        ? "border-primary bg-primary/10"
                        : "border-transparent bg-card hover:bg-muted/50"
                    }`}
                  >
                    <div
                      className={cn(
                        "flex shrink-0 items-center justify-center overflow-hidden rounded-md",
                        isHeroIcon
                          ? isUcl
                            ? "h-10 w-9 bg-black"
                            : "h-10 w-10 bg-black/80"
                          : "h-9 w-9 bg-muted/60"
                      )}
                    >
                      {iconUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={iconUrl}
                          alt=""
                          className={cn(
                            "object-contain",
                            isUcl ? "h-9 w-8" : "h-8 w-8"
                          )}
                        />
                      ) : (
                        <LeagueLogo
                          name={league.name}
                          logoUrl={league.logoUrl}
                          fifaIndexId={league.fifaIndexId}
                          size={28}
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{league.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {getLeagueSubtitle(league.fifaIndexId, league._count.teams) ??
                          `${league._count.teams} equipos`}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            {selectedLeague && (
              <p className="text-xs text-muted-foreground">
                Seleccionado: <strong>{selectedLeague.name}</strong> — los
                participantes elegirán entre {selectedLeague._count.teams}{" "}
                equipos con escudo oficial.
              </p>
            )}
          </>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Formato</Label>
        <select
          id="type"
          name="type"
          className="flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
          required
        >
          {Object.entries(TOURNAMENT_TYPES).map(([key, val]) => (
            <option key={key} value={key}>
              {val.label} — {val.description}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="maxParticipants">Máx. participantes</Label>
          <Input
            id="maxParticipants"
            name="maxParticipants"
            type="number"
            defaultValue={16}
            min={2}
            max={128}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="groupsCount">Nº de grupos</Label>
          <Input
            id="groupsCount"
            name="groupsCount"
            type="number"
            defaultValue={4}
            min={1}
            max={16}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startDate">Fecha inicio</Label>
          <Input id="startDate" name="startDate" type="date" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">Fecha fin</Label>
          <Input id="endDate" name="endDate" type="date" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="twoLegs"
          name="twoLegs"
          value="true"
          className="rounded border-border"
        />
        <Label htmlFor="twoLegs">Ida y vuelta</Label>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending || leagues.length === 0}>
          {isPending ? "Creando..." : "Crear torneo"}
        </Button>
      </div>
    </form>
  );
}
