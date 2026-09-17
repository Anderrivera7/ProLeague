"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { NotificationService } from "@/services/notification-service";
import { ChatRepository } from "@/repositories/chat-repository";

export async function getNotifications() {
  const user = await getCurrentUser();
  if (!user) return [];

  const [appNotifs, matchNotifs] = await Promise.all([
    NotificationService.listForUser(user.id),
    ChatRepository.getMatchResultNotifications(user.id, 10),
  ]);

  const fromMatches = matchNotifs.map((m) => ({
    id: `match-${m.id}`,
    type: "MATCH_RESULT" as const,
    title: m.tournament.name,
    body: m.content,
    href: `/chat/${m.tournamentId}`,
    metadata: { source: "chat", chatMessageId: m.id },
    readAt: null as Date | null,
    createdAt: m.createdAt,
    deletable: false,
  }));

  const fromApp = appNotifs.map((n) => ({
    ...n,
    deletable: true,
  }));

  return [...fromApp, ...fromMatches]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 40);
}

export async function deleteNotification(notificationId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "No autenticado" };
  if (notificationId.startsWith("match-")) {
    return { error: "Esta notificación no se puede borrar" };
  }

  await NotificationService.delete(user.id, notificationId);
  revalidatePath("/", "layout");
  return { success: true };
}

export async function markNotificationRead(notificationId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "No autenticado" };
  if (notificationId.startsWith("match-")) return { success: true };

  await NotificationService.markRead(user.id, notificationId);
  return { success: true };
}

export async function clearAllNotifications() {
  const user = await getCurrentUser();
  if (!user) return { error: "No autenticado" };
  await NotificationService.deleteAll(user.id);
  revalidatePath("/", "layout");
  return { success: true };
}
