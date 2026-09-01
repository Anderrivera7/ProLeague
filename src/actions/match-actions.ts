"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { MatchService } from "@/services/match-service";
import { MatchRepository } from "@/repositories/match-repository";
import { matchResultSchema } from "@/schemas";

function revalidateMatchPaths(
  matchId: string,
  tournamentId: string,
  homeUserId: string,
  awayUserId: string
) {
  revalidatePath("/matches");
  revalidatePath(`/matches/${matchId}`);
  revalidatePath(`/tournaments/${tournamentId}`);
  revalidatePath("/dashboard");
  revalidatePath("/rankings");
  revalidatePath("/stats");
  revalidatePath(`/players/${homeUserId}`);
  revalidatePath(`/players/${awayUserId}`);
  revalidatePath("/chat");
  revalidatePath(`/chat/${tournamentId}`);
}

export async function recordMatchResult(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "No autenticado" };

  const playerStatsRaw = formData.get("playerStats");
  let playerStats = [];
  try {
    playerStats = playerStatsRaw ? JSON.parse(playerStatsRaw as string) : [];
  } catch {
    return { error: "Formato de estadísticas inválido" };
  }

  const parsed = matchResultSchema.safeParse({
    matchId: formData.get("matchId"),
    homeScore: formData.get("homeScore"),
    awayScore: formData.get("awayScore"),
    penaltiesHome: formData.get("penaltiesHome") || undefined,
    penaltiesAway: formData.get("penaltiesAway") || undefined,
    mvpUserId: formData.get("mvpUserId") || undefined,
    playerStats,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const match = await MatchRepository.findById(parsed.data.matchId);
  if (!match) return { error: "Partido no encontrado" };

  const isParticipant =
    match.homeParticipant.userId === user.id ||
    match.awayParticipant.userId === user.id;
  const isCreator = match.tournament.creatorId === user.id;
  if (!isParticipant && !isCreator) {
    return { error: "No tienes permiso para registrar este resultado" };
  }

  try {
    // El creador puede cerrar el partido directamente.
    // Los jugadores proponen y el rival confirma.
    if (isCreator && !isParticipant) {
      await MatchService.recordResult(parsed.data);
      revalidateMatchPaths(
        parsed.data.matchId,
        match.tournamentId,
        match.homeParticipant.userId,
        match.awayParticipant.userId
      );
      return { success: true, matchId: parsed.data.matchId, pendingConfirmation: false };
    }

    if (isCreator && isParticipant) {
      // Creador jugando: también requiere confirmación del rival, salvo que fuerce
      const force = formData.get("force") === "true";
      if (force) {
        await MatchService.recordResult(parsed.data);
        revalidateMatchPaths(
          parsed.data.matchId,
          match.tournamentId,
          match.homeParticipant.userId,
          match.awayParticipant.userId
        );
        return { success: true, matchId: parsed.data.matchId, pendingConfirmation: false };
      }
    }

    await MatchService.proposeResult(parsed.data, user.id);
    revalidateMatchPaths(
      parsed.data.matchId,
      match.tournamentId,
      match.homeParticipant.userId,
      match.awayParticipant.userId
    );
    return {
      success: true,
      matchId: parsed.data.matchId,
      pendingConfirmation: true,
    };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al registrar resultado" };
  }
}

export async function confirmMatchResult(matchId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "No autenticado" };

  const match = await MatchRepository.findById(matchId);
  if (!match) return { error: "Partido no encontrado" };

  try {
    await MatchService.confirmProposedResult(matchId, user.id);
    revalidateMatchPaths(
      matchId,
      match.tournamentId,
      match.homeParticipant.userId,
      match.awayParticipant.userId
    );
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al confirmar resultado" };
  }
}

export async function rejectMatchResult(matchId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "No autenticado" };

  const match = await MatchRepository.findById(matchId);
  if (!match) return { error: "Partido no encontrado" };

  try {
    await MatchService.rejectProposedResult(matchId, user.id);
    revalidateMatchPaths(
      matchId,
      match.tournamentId,
      match.homeParticipant.userId,
      match.awayParticipant.userId
    );
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al rechazar resultado" };
  }
}
