import { prisma } from "@/lib/prisma";
import { getEaPlayerPortraitUrl } from "@/lib/fc-data/player-image";
import type { ScrapedPlayerData } from "@/lib/fc-data/types";

export class PlayerRepository {
  static async findByTeamId(teamId: string) {
    return prisma.fcPlayer.findMany({
      where: { teamId },
      orderBy: [{ jerseyNumber: "asc" }, { overall: "desc" }],
    });
  }

  static async countByTeamId(teamId: string) {
    return prisma.fcPlayer.count({ where: { teamId } });
  }

  static async deleteByTeamId(teamId: string) {
    const removable = await prisma.fcPlayer.findMany({
      where: { teamId, matchStats: { none: {} } },
      select: { id: true },
    });
    if (removable.length === 0) return { count: 0 };
    return prisma.fcPlayer.deleteMany({
      where: { id: { in: removable.map((p) => p.id) } },
    });
  }

  static async replaceSquad(teamId: string, players: ScrapedPlayerData[]) {
    const upserted = await this.upsertMany(teamId, players);
    const keepEaIds = new Set(players.map((p) => p.eaId));

    const current = await prisma.fcPlayer.findMany({
      where: { teamId },
      select: {
        id: true,
        fifaIndexId: true,
        _count: { select: { matchStats: true } },
      },
    });

    const staleIds = current
      .filter((p) => !keepEaIds.has(p.fifaIndexId) && p._count.matchStats === 0)
      .map((p) => p.id);

    if (staleIds.length > 0) {
      await prisma.fcPlayer.deleteMany({ where: { id: { in: staleIds } } });
    }

    return upserted;
  }

  static async upsertMany(teamId: string, players: ScrapedPlayerData[]) {
    const results = [];
    for (const player of players) {
      const row = await prisma.fcPlayer.upsert({
        where: { fifaIndexId: player.eaId },
        create: {
          fifaIndexId: player.eaId,
          name: player.name,
          position: player.position,
          squadRole: player.squadRole,
          jerseyNumber: player.jerseyNumber,
          overall: player.overall,
          potential: player.potential,
          nationality: player.nationality,
          imageUrl: player.imageUrl ?? getEaPlayerPortraitUrl(player.eaId),
          pace: player.pace,
          shooting: player.shooting,
          passing: player.passing,
          dribbling: player.dribbling,
          defending: player.defending,
          physic: player.physic,
          teamId,
        },
        update: {
          name: player.name,
          position: player.position,
          squadRole: player.squadRole,
          jerseyNumber: player.jerseyNumber,
          overall: player.overall,
          potential: player.potential,
          nationality: player.nationality,
          imageUrl: player.imageUrl ?? getEaPlayerPortraitUrl(player.eaId),
          pace: player.pace,
          shooting: player.shooting,
          passing: player.passing,
          dribbling: player.dribbling,
          defending: player.defending,
          physic: player.physic,
          teamId,
        },
      });
      results.push(row);
    }
    return results;
  }
}
