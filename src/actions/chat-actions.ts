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

  try {
    const message = await ChatRepository.createUserMessage(
      tournamentId,
      user.id,
      parsed.data.content
    );

    revalidatePath(`/chat/${tournamentId}`);
    revalidatePath("/chat");

    return {
      success: true,
      message: {
        id: message.id,
        type: message.type,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
        user: message.user,
      },
    };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "No se pudo enviar el mensaje",
    };
  }
}

export async function touchLastActive() {
  try {
    const user = await getCurrentUser();
    if (!user) return;

    const now = new Date();
    const last = user.lastActiveAt ? new Date(user.lastActiveAt) : null;
    if (last && now.getTime() - last.getTime() < 60_000) return;

    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: now },
    });
  } catch {
    // Sin conexión a BD o sesión inválida — ignorar
  }
}

export async function getMatchNotifications() {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    await ChatRepository.syncAllForUser(user.id);
    return ChatRepository.getMatchResultNotifications(user.id);
  } catch {
    return [];
  }
}
