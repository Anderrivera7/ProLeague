"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/actions/auth-actions";
import { ChatRepository } from "@/repositories/chat-repository";
import { prisma } from "@/lib/prisma";

const messageSchema = z.object({
  tournamentId: z.string().uuid(),
  content: z.string().trim().min(1).max(500),
});

export async function sendChatMessage(tournamentId: string, content: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "No autenticado" };

  const parsed = messageSchema.safeParse({ tournamentId, content });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Mensaje inválido" };
  }

  const isParticipant = await ChatRepository.isParticipant(
    tournamentId,
    user.id
  );
  if (!isParticipant) {
    return { error: "No participas en este torneo" };
  }

  await ChatRepository.createUserMessage(
    tournamentId,
    user.id,
    parsed.data.content
  );

  revalidatePath(`/chat/${tournamentId}`);
  return { success: true };
}

export async function touchLastActive() {
  const user = await getCurrentUser();
  if (!user) return;

  const now = new Date();
  const last = user.lastActiveAt ? new Date(user.lastActiveAt) : null;
  if (last && now.getTime() - last.getTime() < 60_000) return;

  await prisma.user.update({
    where: { id: user.id },
    data: { lastActiveAt: now },
  });
}

export async function getMatchNotifications() {
  const user = await getCurrentUser();
  if (!user) return [];

  await ChatRepository.syncAllForUser(user.id);
  return ChatRepository.getMatchResultNotifications(user.id);
}
