import { TournamentRepository } from "@/repositories/tournament-repository";
import {
  generateTournamentFixture,
  initializeStandings,
} from "@/utils/tournament-engine";
import type { TournamentCreateInput } from "@/schemas";
import type { TournamentType } from "@prisma/client";

export class TournamentService {
  static async create(input: TournamentCreateInput, creatorId: string) {
    const joinCode = await TournamentRepository.createUniqueJoinCode();

    const tournament = await TournamentRepository.create({
      name: input.name,
      description: input.description,
      type: input.type as TournamentType,
      maxParticipants: input.maxParticipants,
      groupsCount: input.groupsCount,
      teamsPerGroup: input.teamsPerGroup,
      twoLegs: input.twoLegs,
      pointsWin: input.pointsWin,
      pointsDraw: input.pointsDraw,
      pointsLoss: input.pointsLoss,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
      joinCode,
      ...(input.fcLeagueId && {
        fcLeague: { connect: { id: input.fcLeagueId } },
      }),
      creator: { connect: { id: creatorId } },
      status: "REGISTRATION",
    });

    await TournamentRepository.addParticipant(tournament.id, creatorId, 1);

    return tournament;
  }

  static async ensureCreatorEnrolled(tournamentId: string, creatorId: string) {
    const existing = await TournamentRepository.getParticipant(
      tournamentId,
      creatorId
    );
    if (!existing) {
      await TournamentRepository.addParticipant(tournamentId, creatorId, 1);
    }
  }

  static async joinByCode(joinCode: string, userId: string) {
    const tournament = await TournamentRepository.findByJoinCode(joinCode);
    if (!tournament) throw new Error("Código de torneo no válido");
    if (tournament.status !== "REGISTRATION") {
      throw new Error("Este torneo ya no acepta inscripciones");
    }
    if (tournament._count.participants >= tournament.maxParticipants) {
      throw new Error("El torneo está lleno");
    }

    const existing = await TournamentRepository.getParticipant(
      tournament.id,
      userId
    );
    if (existing) return { tournament, alreadyJoined: true };

    await TournamentRepository.addParticipant(tournament.id, userId);
    return { tournament, alreadyJoined: false };
  }

  static async selectTeam(
    tournamentId: string,
    userId: string,
    fcTeamId: string
  ) {
    const tournament = await TournamentRepository.findById(tournamentId);
    if (!tournament) throw new Error("Torneo no encontrado");

    const participant = await TournamentRepository.getParticipant(
      tournamentId,
      userId
    );
    if (!participant) throw new Error("No estás inscrito en este torneo");

    if (tournament.fcLeagueId) {
      const { prisma } = await import("@/lib/prisma");
      const team = await prisma.fcTeam.findFirst({
        where: { id: fcTeamId, leagueId: tournament.fcLeagueId },
      });
      if (!team) throw new Error("Este equipo no pertenece a la competición");
    }

    const taken = tournament.participants.some(
      (p) => p.fcTeamId === fcTeamId && p.userId !== userId
    );
    if (taken) throw new Error("Ese equipo ya fue elegido por otro jugador");

    return TournamentRepository.setParticipantTeam(
      tournamentId,
      userId,
      fcTeamId
    );
  }

  static async generateFixture(tournamentId: string) {
    const tournament = await TournamentRepository.findById(tournamentId);
    if (!tournament) throw new Error("Torneo no encontrado");
    if (tournament.participants.length < 2) {
      throw new Error("Se necesitan al menos 2 participantes");
    }

    const participants = tournament.participants.map((p) => ({
      id: p.id,
      userId: p.userId,
      seed: p.seed ?? undefined,
    }));

    const matches = generateTournamentFixture(
      tournament.type,
      participants,
      {
        groupsCount: tournament.groupsCount ?? 4,
        twoLegs: tournament.twoLegs,
      }
    );

    await TournamentRepository.createMatches(tournamentId, matches);

    if (
      tournament.type === "LEAGUE" ||
      tournament.type === "GROUPS" ||
      tournament.type === "GROUPS_KNOCKOUT"
    ) {
      if (tournament.type === "GROUPS" || tournament.type === "GROUPS_KNOCKOUT") {
        const groupsCount = tournament.groupsCount ?? 4;
        for (let i = 0; i < groupsCount; i++) {
          const groupName = String.fromCharCode(65 + i);
          const groupParticipants = participants.filter(
            (_, idx) => idx % groupsCount === i
          );
          const standings = initializeStandings(groupParticipants, groupName);
          await TournamentRepository.createStandings(
            tournamentId,
            standings.map((s) => ({ ...s, groupName }))
          );
        }
      } else {
        const standings = initializeStandings(participants);
        await TournamentRepository.createStandings(tournamentId, standings);
      }
    }

    await TournamentRepository.update(tournamentId, { status: "ACTIVE" });

    return { matchCount: matches.length };
  }

  static async delete(tournamentId: string, userId: string) {
    const tournament = await TournamentRepository.findById(tournamentId);
    if (!tournament) throw new Error("Torneo no encontrado");
    if (tournament.creatorId !== userId) {
      throw new Error("No tienes permisos para eliminar este torneo");
    }
    await TournamentRepository.delete(tournamentId);
    return { success: true };
  }
}
