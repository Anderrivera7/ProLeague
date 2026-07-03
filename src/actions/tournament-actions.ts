"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/actions/auth-actions";
import { TournamentService } from "@/services/tournament-service";
import { FifaDbRepository } from "@/repositories/fifa-db-repository";
import {
  tournamentCreateSchema,
  joinTournamentSchema,
  selectTeamSchema,
} from "@/schemas";

function formValue(value: FormDataEntryValue | null) {
  if (value === null || value === "") return undefined;
  return value;
}

export async function getFcLeagues() {
  return FifaDbRepository.getLeagues();
}

export async function getFcTeams(leagueId?: string, search?: string) {
  return FifaDbRepository.getTeams(search, leagueId, 100);
}

export async function getFcTeam(teamId: string) {
  return FifaDbRepository.getTeamById(teamId);
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
    fcLeagueId: formValue(formData.get("fcLeagueId")),
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
    return {
      success: true,
      tournamentId: tournament.id,
      joinCode: tournament.joinCode,
    };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al crear torneo" };
  }
}

export async function joinTournament(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "No autenticado" };

  const parsed = joinTournamentSchema.safeParse({
    joinCode: formData.get("joinCode"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Código inválido" };
  }

  try {
    const { tournament } = await TournamentService.joinByCode(
      parsed.data.joinCode,
      user.id
    );
    revalidatePath("/tournaments");
    revalidatePath(`/tournaments/${tournament.id}`);
    return { success: true, tournamentId: tournament.id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo unir al torneo" };
  }
}

export async function selectTournamentTeam(
  tournamentId: string,
  fcTeamId: string
) {
  const user = await getCurrentUser();
  if (!user) return { error: "No autenticado" };

  const parsed = selectTeamSchema.safeParse({ tournamentId, fcTeamId });
  if (!parsed.success) {
    return { error: "Datos inválidos" };
  }

  try {
    await TournamentService.selectTeam(
      parsed.data.tournamentId,
      user.id,
      parsed.data.fcTeamId
    );
    revalidatePath(`/tournaments/${tournamentId}`);
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo elegir equipo" };
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
