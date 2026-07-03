"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTournament } from "@/actions/tournament-actions";
import { TOURNAMENT_TYPES } from "@/constants";

interface LeagueOption {
  id: string;
  name: string;
  _count: { teams: number };
}

interface CreateTournamentFormProps {
  leagues: LeagueOption[];
}

export function CreateTournamentForm({ leagues }: CreateTournamentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

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

      <div className="space-y-2">
        <Label htmlFor="fcLeagueId">Competición (equipos EA FC)</Label>
        <select
          id="fcLeagueId"
          name="fcLeagueId"
          className="flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
          defaultValue={leagues[0]?.id ?? ""}
        >
          {leagues.length === 0 ? (
            <option value="">Sin ligas — ejecuta seed:fc-teams</option>
          ) : (
            leagues.map((league) => (
              <option key={league.id} value={league.id}>
                {league.name} ({league._count.teams} equipos)
              </option>
            ))
          )}
        </select>
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
