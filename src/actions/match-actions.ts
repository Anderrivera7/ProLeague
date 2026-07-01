"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/actions/auth-actions";
import { MatchService } from "@/services/match-service";
import { matchResultSchema } from "@/schemas";

export async function recordMatchResult(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "No autenticado" };

  const eventsRaw = formData.get("events");
  let events = [];
  try {
    events = eventsRaw ? JSON.parse(eventsRaw as string) : [];
  } catch {
    return { error: "Formato de eventos inválido" };
  }

  const parsed = matchResultSchema.safeParse({
    matchId: formData.get("matchId"),
    homeScore: formData.get("homeScore"),
    awayScore: formData.get("awayScore"),
    penaltiesHome: formData.get("penaltiesHome"),
    penaltiesAway: formData.get("penaltiesAway"),
    mvpUserId: formData.get("mvpUserId") || undefined,
    events,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  try {
    await MatchService.recordResult(parsed.data);
    revalidatePath("/matches");
    revalidatePath("/dashboard");
    revalidatePath("/rankings");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al registrar resultado" };
  }
}
