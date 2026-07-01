"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createTournament } from "@/actions/tournament-actions";
import { TOURNAMENT_TYPES } from "@/constants";

export default function CreateTournamentPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createTournament(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Torneo creado correctamente");
        router.push(`/tournaments/${result.tournamentId}`);
      }
    });
  }

  return (
    <>
      <Header title="Crear Torneo" subtitle="Configura tu nueva competición" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <Card className="mx-auto max-w-2xl glass">
          <CardHeader>
            <CardTitle>Detalles del Torneo</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Copa ProLeague 2026"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Descripción opcional del torneo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Torneo</Label>
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
                  <Label htmlFor="maxParticipants">Máx. Participantes</Label>
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
                  <Label htmlFor="groupsCount">Nº de Grupos</Label>
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
                  <Label htmlFor="startDate">Fecha Inicio</Label>
                  <Input id="startDate" name="startDate" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Fecha Fin</Label>
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Creando..." : "Crear Torneo"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
