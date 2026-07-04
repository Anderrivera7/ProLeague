import { prisma } from "@/lib/prisma";
import { buildMatchResultMessage } from "@/utils/match-result-message";

export class ChatRepository {
  static async getEnrolledTournaments(userId: string) {
    await ChatRepository.syncAllForUser(userId);

    const participations = await prisma.tournamentParticipant.findMany({
      where: { userId },
      include: {
        tournament: {
          include: {
            _count: { select: { participants: true, messages: true } },
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
              include: { user: { select: { nickname: true } } },
            },
          },
        },
        fcTeam: { select: { name: true } },
      },
      orderBy: { tournament: { updatedAt: "desc" } },
    });

    return participations.map((p) => ({
      tournamentId: p.tournament.id,
      name: p.tournament.name,
      status: p.tournament.status,
      teamName: p.fcTeam?.name ?? null,
      participantsCount: p.tournament._count.participants,
      lastMessage: p.tournament.messages[0] ?? null,
    }));
  }

  static async isParticipant(tournamentId: string, userId: string) {
    const p = await prisma.tournamentParticipant.findFirst({
      where: { tournamentId, userId },
    });
    return !!p;
  }

  static async syncMatchResultMessages(tournamentId: string) {
    const matches = await prisma.match.findMany({
      where: {
        tournamentId,
        status: "COMPLETED",
        homeScore: { not: null },
        awayScore: { not: null },
      },
      include: {
        homeParticipant: { include: { user: true, fcTeam: true } },
        awayParticipant: { include: { user: true, fcTeam: true } },
      },
      orderBy: { playedAt: "asc" },
    });

    if (matches.length === 0) return;

    const existing = await prisma.tournamentMessage.findMany({
      where: { tournamentId, type: "MATCH_RESULT" },
      select: { id: true, matchId: true, content: true },
    });

    const syncedMatchIds = new Set(
      existing.map((m) => m.matchId).filter(Boolean) as string[]
    );
    const existingContents = new Set(existing.map((m) => m.content));

    for (const match of matches) {
      if (syncedMatchIds.has(match.id)) continue;

      const content = buildMatchResultMessage(match);
      if (!content) continue;

      if (existingContents.has(content)) {
        const legacy = existing.find(
          (m) => m.content === content && !m.matchId
        );
        if (legacy) {
          await prisma.tournamentMessage.update({
            where: { id: legacy.id },
            data: { matchId: match.id },
          });
        }
        continue;
      }

      await prisma.tournamentMessage.create({
        data: {
          tournamentId,
          type: "MATCH_RESULT",
          content,
          matchId: match.id,
          createdAt: match.playedAt ?? match.updatedAt,
        },
      });
      existingContents.add(content);
    }
  }

  static async syncAllForUser(userId: string) {
    const participations = await prisma.tournamentParticipant.findMany({
      where: { userId },
      select: { tournamentId: true },
    });

    await Promise.all(
      participations.map((p) =>
        ChatRepository.syncMatchResultMessages(p.tournamentId)
      )
    );
  }

  static async getMatchResultNotifications(userId: string, limit = 15) {
    const participations = await prisma.tournamentParticipant.findMany({
      where: { userId },
      select: { tournamentId: true },
    });

    const tournamentIds = participations.map((p) => p.tournamentId);
    if (tournamentIds.length === 0) return [];

    return prisma.tournamentMessage.findMany({
      where: {
        tournamentId: { in: tournamentIds },
        type: "MATCH_RESULT",
      },
      include: {
        tournament: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  static async getMessages(tournamentId: string, limit = 100) {
    await ChatRepository.syncMatchResultMessages(tournamentId);

    return prisma.tournamentMessage.findMany({
      where: { tournamentId },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatarUrl: true,
            lastActiveAt: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
      take: limit,
    });
  }

  static async getParticipants(tournamentId: string) {
    return prisma.tournamentParticipant.findMany({
      where: { tournamentId },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatarUrl: true,
            lastActiveAt: true,
          },
        },
        fcTeam: { select: { name: true } },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  static async createUserMessage(
    tournamentId: string,
    userId: string,
    content: string
  ) {
    return prisma.tournamentMessage.create({
      data: {
        tournamentId,
        userId,
        type: "USER",
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatarUrl: true,
            lastActiveAt: true,
          },
        },
      },
    });
  }

  static async createMatchResultMessage(
    tournamentId: string,
    content: string
  ) {
    return prisma.tournamentMessage.create({
      data: {
        tournamentId,
        type: "MATCH_RESULT",
        content,
      },
    });
  }
}
