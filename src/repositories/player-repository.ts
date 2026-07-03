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
    return prisma.fcPlayer.deleteMany({ where: { teamId } });
  }

  static async replaceSquad(teamId: string, players: ScrapedPlayerData[]) {
    await prisma.fcPlayer.deleteMany({ where: { teamId } });
    return this.upsertMany(teamId, players);
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
