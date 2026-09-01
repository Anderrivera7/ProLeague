import { CrewRepository } from "@/repositories/crew-repository";

const MAX_MEMBERS = 20;
const JOIN_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateJoinCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += JOIN_CODE_CHARS[Math.floor(Math.random() * JOIN_CODE_CHARS.length)];
  }
  return code;
}

export type CrewPodiumEntry = {
  userId: string;
  nickname: string;
  avatarUrl: string | null;
  elo: number;
  titlesWon: number;
  wins: number;
  matchesPlayed: number;
  rank: number;
  isCurrentUser: boolean;
  isOwner: boolean;
  recentTrophies: {
    id: string;
    title: string;
    wonAt: Date;
    leagueFifaId: string | null;
    leagueName: string | null;
  }[];
};

export class CrewService {
  static async createCrew(userId: string, name: string) {
    let joinCode = generateJoinCode();
    let attempts = 0;

    while (attempts < 10) {
      const existing = await CrewRepository.findByJoinCode(joinCode);
      if (!existing) break;
      joinCode = generateJoinCode();
      attempts++;
    }

    return CrewRepository.create({ name, joinCode, ownerId: userId });
  }

  static async joinCrew(userId: string, joinCode: string) {
    const crew = await CrewRepository.findByJoinCode(joinCode);
    if (!crew) return { error: "Código de grupo no válido" };

    const already = await CrewRepository.isMember(crew.id, userId);
    if (already) return { error: "Ya perteneces a este grupo" };

    const count = await CrewRepository.countMembers(crew.id);
    if (count >= MAX_MEMBERS) {
      return { error: `El grupo está lleno (máx. ${MAX_MEMBERS})` };
    }

    await CrewRepository.addMember(crew.id, userId);
    return { success: true, crewId: crew.id };
  }

  static async leaveCrew(userId: string, crewId: string) {
    const crew = await CrewRepository.findById(crewId);
    if (!crew) return { error: "Grupo no encontrado" };

    const isMember = await CrewRepository.isMember(crewId, userId);
    if (!isMember) return { error: "No perteneces a este grupo" };

    if (crew.ownerId === userId) {
      const count = await CrewRepository.countMembers(crewId);
      if (count > 1) {
        return {
          error:
            "Transfiere la propiedad o elimina el grupo antes de salir (eres el creador)",
        };
      }
      await CrewRepository.deleteCrew(crewId);
      return { success: true, deleted: true };
    }

    await CrewRepository.removeMember(crewId, userId);
    return { success: true };
  }

  static async deleteCrew(userId: string, crewId: string) {
    const crew = await CrewRepository.findById(crewId);
    if (!crew) return { error: "Grupo no encontrado" };
    if (crew.ownerId !== userId) {
      return { error: "Solo el creador puede eliminar el grupo" };
    }

    await CrewRepository.deleteCrew(crewId);
    return { success: true };
  }

  static async removeMember(
    ownerId: string,
    crewId: string,
    memberId: string
  ) {
    const crew = await CrewRepository.findById(crewId);
    if (!crew) return { error: "Grupo no encontrado" };
    if (crew.ownerId !== ownerId) {
      return { error: "Solo el creador puede expulsar miembros" };
    }
    if (memberId === ownerId) {
      return { error: "No puedes expulsarte a ti mismo" };
    }

    await CrewRepository.removeMember(crewId, memberId);
    return { success: true };
  }

  static async getPodium(
    crewId: string,
    currentUserId: string
  ): Promise<CrewPodiumEntry[] | null> {
    const crew = await CrewRepository.findById(crewId);
    if (!crew) return null;

    const isMember = crew.members.some((m) => m.userId === currentUserId);
    if (!isMember) return null;

    const sorted = [...crew.members].sort((a, b) => {
      const titlesA = a.user.stats?.titlesWon ?? 0;
      const titlesB = b.user.stats?.titlesWon ?? 0;
      if (titlesB !== titlesA) return titlesB - titlesA;
      const winsA = a.user.stats?.wins ?? 0;
      const winsB = b.user.stats?.wins ?? 0;
      if (winsB !== winsA) return winsB - winsA;
      return b.user.elo - a.user.elo;
    });

    return sorted.map((m, i) => ({
      userId: m.user.id,
      nickname: m.user.nickname,
      avatarUrl: m.user.avatarUrl,
      elo: m.user.elo,
      titlesWon: m.user.stats?.titlesWon ?? 0,
      wins: m.user.stats?.wins ?? 0,
      matchesPlayed: m.user.stats?.matchesPlayed ?? 0,
      rank: i + 1,
      isCurrentUser: m.user.id === currentUserId,
      isOwner: m.user.id === crew.ownerId,
      recentTrophies: m.user.trophies.map((t) => ({
        id: t.id,
        title: t.title,
        wonAt: t.wonAt,
        leagueFifaId: t.tournament?.fcLeague?.fifaIndexId ?? null,
        leagueName: t.tournament?.fcLeague?.name ?? null,
      })),
    }));
  }

  static async listUserCrews(userId: string) {
    return CrewRepository.listForUser(userId);
  }

  static async getCrewForMember(crewId: string, userId: string) {
    const crew = await CrewRepository.findById(crewId);
    if (!crew) return null;
    const isMember = crew.members.some((m) => m.userId === userId);
    if (!isMember) return null;
    return crew;
  }
}
