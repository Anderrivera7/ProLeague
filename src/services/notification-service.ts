import type { NotificationType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type Db = typeof prisma | Prisma.TransactionClient;

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  href: string | null;
  metadata: Prisma.JsonValue | null;
  readAt: Date | null;
  createdAt: Date;
};

export class NotificationService {
  static async create(
    db: Db,
    input: {
      userId: string;
      type: NotificationType;
      title: string;
      body?: string | null;
      href?: string | null;
      metadata?: Prisma.InputJsonValue;
    }
  ) {
    return db.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body ?? null,
        href: input.href ?? null,
        metadata: input.metadata,
      },
    });
  }

  static async listForUser(userId: string, limit = 30): Promise<AppNotification[]> {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        type: true,
        title: true,
        body: true,
        href: true,
        metadata: true,
        readAt: true,
        createdAt: true,
      },
    });
  }

  static async markRead(userId: string, notificationId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { readAt: new Date() },
    });
  }

  static async delete(userId: string, notificationId: string) {
    return prisma.notification.deleteMany({
      where: { id: notificationId, userId },
    });
  }

  static async deleteAll(userId: string) {
    return prisma.notification.deleteMany({
      where: { userId },
    });
  }
}
