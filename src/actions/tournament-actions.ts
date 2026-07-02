"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/actions/auth-actions";
import { TournamentService } from "@/services/tournament-service";
import { tournamentCreateSchema } from "@/schemas";

function formValue(value: FormDataEntryValue | null) {
  if (value === null || value === "") return undefined;
  return value;
}

export async function createTournament(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "No autenticado" };

  const parsed = tournamentCreateSchema.safeParse({
    name: formData.get("name"),
    description: formValue(formData.get("description")),
    type: formData.get("type"),
    maxParticipants: formData.get("maxParticipants"),
    groupsCount: formValue(formData.get("groupsCount")),
    teamsPerGroup: formValue(formData.get("teamsPerGroup")),
    twoLegs: formData.get("twoLegs") === "true",
    startDate: formValue(formData.get("startDate")),
    endDate: formValue(formData.get("endDate")),
  });

  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => issue.message)
      .filter(Boolean)
      .join(". ");
    return { error: message || "Datos inválidos" };
  }

  try {
    const tournament = await TournamentService.create(parsed.data, user.id);
    revalidatePath("/tournaments");
    return { success: true, tournamentId: tournament.id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al crear torneo" };
  }
}

export async function generateTournamentFixture(tournamentId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "No autenticado" };

  try {
    const result = await TournamentService.generateFixture(tournamentId);
    revalidatePath(`/tournaments/${tournamentId}`);
    return { success: true, ...result };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al generar fixture" };
  }
}

export async function deleteTournament(tournamentId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "No autenticado" };

  try {
    await TournamentService.delete(tournamentId, user.id);
    revalidatePath("/tournaments");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al eliminar torneo" };
  }
}
