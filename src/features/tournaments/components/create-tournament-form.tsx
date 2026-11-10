"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { toast } from "sonner";
import { LeagueLogo } from "@/components/shared/league-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTournament } from "@/actions/tournament-actions";
import {
  AdminRosterFields,
  rosterPayload,
  type RosterSeat,
  type RosterUser,
} from "@/features/tournaments/components/admin-roster-fields";
import { TOURNAMENT_TYPES } from "@/constants";
import {
  getLeagueCoverUrl,
  getLeagueSubtitle,
} from "@/lib/fc-data/club-ids";
import { getLeagueTrophyUrl } from "@/lib/fc-data/league-trophies";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface LeagueOption {
  id: string;
  name: string;
  logoUrl: string | null;
  fifaIndexId: string;
  _count: { teams: number };
}

interface CreateTournamentFormProps {
  leagues: LeagueOption[];
  isAdmin?: boolean;
  currentUserId?: string;
  currentNickname?: string;
  users?: RosterUser[];
}

export function CreateTournamentForm({
  leagues,
  isAdmin = false,
  currentUserId = "",
  currentNickname = "",
  users = [],
}: CreateTournamentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedLeagueId, setSelectedLeagueId] = useState(
    leagues[0]?.id ?? ""
  );
  const [tournamentType, setTournamentType] = useState("LEAGUE");
  const [maxParticipants, setMaxParticipants] = useState(16);
  const [seats, setSeats] = useState<RosterSeat[]>(() =>
    Array.from({ length: 16 }, (_, index) => ({
      userId: index === 0 ? currentUserId : "",
      fcTeamId: "",
    }))
  );
  const forceTwoLegs =
    tournamentType === "GROUPS_KNOCKOUT" || tournamentType === "TWO_LEGS";

  const selectedLeague = leagues.find((l) => l.id === selectedLeagueId);
  const coverUrl = selectedLeague
    ? getLeagueCoverUrl(selectedLeague.fifaIndexId, selectedLeague.name)
    : null;
  const selectedTrophyUrl = selectedLeague
    ? getLeagueTrophyUrl(selectedLeague.fifaIndexId, selectedLeague.name)
    : null;

  function resizeSeats(count: number) {
    const size = Math.min(128, Math.max(2, count || 2));
    setMaxParticipants(size);
    setSeats((current) => {
      const next = current.slice(0, size);
      while (next.length < size) next.push({ userId: "", fcTeamId: "" });
      if (currentUserId) next[0] = { ...next[0], userId: currentUserId };
      return next;
    });
  }

  function changeLeague(leagueId: string) {
    setSelectedLeagueId(leagueId);
    setSeats((current) =>
      current.map((seat, index) => ({
        ...seat,
        fcTeamId: "",
        userId: index === 0 ? currentUserId : seat.userId,
      }))
    );
  }

  function handleSubmit(formData: FormData) {
    if (isAdmin) {
      const roster = rosterPayload(seats, currentUserId);
      if ("error" in roster && roster.error) {
        toast.error(roster.error);
        return;
      }
      if (roster.json) formData.set("roster", roster.json);
    }
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
        <div>
          <Label>Competición</Label>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {isAdmin
              ? "Elige la liga. Tú asignas el equipo de cada jugador."
              : "Elige la liga; los jugadores escogerán equipo de esa competición"}
          </p>
        </div>

        {selectedLeague && (
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c0c]">
            {coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-40"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/40" />
            <div className="relative flex items-center gap-4 p-4 sm:gap-5 sm:p-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/50 shadow-lg sm:h-20 sm:w-20">
                {selectedTrophyUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedTrophyUrl}
                    alt=""
                    className="h-12 w-12 object-contain drop-shadow-md sm:h-14 sm:w-14"
                  />
                ) : (
                  <LeagueLogo
                    name={selectedLeague.name}
                    logoUrl={selectedLeague.logoUrl}
                    fifaIndexId={selectedLeague.fifaIndexId}
                    size={48}
                  />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/90">
                  Seleccionada
                </p>
                <p className="mt-1 truncate text-lg font-semibold tracking-tight sm:text-xl">
                  {selectedLeague.name}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                  {getLeagueSubtitle(
                    selectedLeague.fifaIndexId,
                    selectedLeague._count.teams
                  ) ?? `${selectedLeague._count.teams} equipos disponibles`}
                </p>
              </div>
            </div>
          </div>
        )}

        {leagues.length === 0 ? (
          <p className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
            No hay competiciones disponibles en este momento. Si acabas de
            desplegar la app, espera unos minutos a que termine la carga de
            datos o contacta al administrador.
          </p>
        ) : (
          <>
            <input type="hidden" name="fcLeagueId" value={selectedLeagueId} />
            <div className="grid max-h-[22rem] gap-2 overflow-y-auto rounded-2xl border border-border/80 bg-black/20 p-2 sm:grid-cols-2 sm:gap-2.5 sm:p-2.5">
              {leagues.map((league) => {
                const selected = league.id === selectedLeagueId;
                const trophyUrl = getLeagueTrophyUrl(
                  league.fifaIndexId,
                  league.name
                );
                const subtitle =
                  getLeagueSubtitle(league.fifaIndexId, league._count.teams) ??
                  `${league._count.teams} equipos`;

                return (
                  <button
                    key={league.id}
                    type="button"
                    onClick={() => changeLeague(league.id)}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all",
                      selected
                        ? "border-primary/50 bg-primary/10 shadow-[0_0_0_1px_rgba(34,197,94,0.12)]"
                        : "border-transparent bg-card/80 hover:border-white/10 hover:bg-card"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-colors",
                        selected
                          ? "border-primary/30 bg-black/70"
                          : "border-white/8 bg-black/40 group-hover:border-white/12"
                      )}
                    >
                      {trophyUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={trophyUrl}
                          alt=""
                          className="h-9 w-9 object-contain drop-shadow-sm"
                        />
                      ) : (
                        <LeagueLogo
                          name={league.name}
                          logoUrl={league.logoUrl}
                          fifaIndexId={league.fifaIndexId}
                          size={32}
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 pr-5">
                      <p className="truncate text-sm font-semibold tracking-tight">
                        {league.name}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                        {subtitle}
                      </p>
                    </div>
                    {selected && (
                      <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
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
          value={tournamentType}
          onChange={(e) => setTournamentType(e.target.value)}
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
            value={maxParticipants}
            min={2}
            max={128}
            onChange={(event) => resizeSeats(Number(event.target.value))}
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
        {forceTwoLegs ? (
          <input type="hidden" name="twoLegs" value="true" />
        ) : null}
        <input
          type="checkbox"
          id="twoLegs"
          name={forceTwoLegs ? undefined : "twoLegs"}
          value="true"
          defaultChecked={forceTwoLegs}
          disabled={forceTwoLegs}
          className="rounded border-border"
        />
        <Label htmlFor="twoLegs">
          Ida y vuelta
          {forceTwoLegs ? " (incluido en este formato)" : ""}
        </Label>
      </div>

      {isAdmin && currentUserId ? (
        <AdminRosterFields
          currentUserId={currentUserId}
          currentNickname={currentNickname}
          users={users}
          leagueId={selectedLeagueId}
          seats={seats}
          onChange={setSeats}
        />
      ) : null}

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
