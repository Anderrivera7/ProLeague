"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/actions/auth-actions";
import { MatchService } from "@/services/match-service";
import { MatchRepository } from "@/repositories/match-repository";
import { matchResultSchema } from "@/schemas";

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
    await MatchService.recordResult(parsed.data);
    revalidatePath("/matches");
    revalidatePath(`/matches/${parsed.data.matchId}`);
    revalidatePath(`/tournaments/${match.tournamentId}`);
    revalidatePath("/dashboard");
    revalidatePath("/rankings");
    revalidatePath("/stats");
    revalidatePath(`/players/${match.homeParticipant.userId}`);
    revalidatePath(`/players/${match.awayParticipant.userId}`);
    return { success: true, matchId: parsed.data.matchId };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al registrar resultado" };
  }
}
