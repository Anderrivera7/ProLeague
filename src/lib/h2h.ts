import { prisma } from "@/lib/prisma";
import { isBetterWin } from "@/utils/match-stats";

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

/** Actualiza H2H bidireccional tras un resultado 1v1. */
export async function applyHeadToHeadResult(
  tx: Tx | typeof prisma,
  userId: string,
  opponentId: string,
  data: {
    homeWon: boolean;
    awayWon: boolean;
    isDraw: boolean;
    homeScore: number;
    awayScore: number;
  }
) {
  const upsertH2H = async (
    uid: string,
    oid: string,
    won: boolean,
    drawn: boolean,
    lost: boolean,
    gf: number,
    ga: number
  ) => {
    const existing = await tx.headToHead.findUnique({
      where: { userId_opponentId: { userId: uid, opponentId: oid } },
    });

    // Racha sin perder (victoria o empate)
    const streak =
      won || drawn ? (existing?.currentStreak ?? 0) + 1 : 0;
    const margin = gf - ga;
    const oldMargin = existing?.biggestWin ?? 0;
    const oldGf = existing?.biggestWinFor ?? 0;
    const isNewBestWin = won && isBetterWin(margin, gf, oldMargin, oldGf);

    await tx.headToHead.upsert({
      where: { userId_opponentId: { userId: uid, opponentId: oid } },
      create: {
        userId: uid,
        opponentId: oid,
        matchesPlayed: 1,
        wins: won ? 1 : 0,
        draws: drawn ? 1 : 0,
        losses: lost ? 1 : 0,
        goalsFor: gf,
        goalsAgainst: ga,
        biggestWin: won ? margin : 0,
        biggestWinFor: won ? gf : 0,
        biggestWinAgainst: won ? ga : 0,
        currentStreak: streak,
        bestStreak: streak,
      },
      update: {
        matchesPlayed: { increment: 1 },
        wins: won ? { increment: 1 } : undefined,
        draws: drawn ? { increment: 1 } : undefined,
        losses: lost ? { increment: 1 } : undefined,
        goalsFor: { increment: gf },
        goalsAgainst: { increment: ga },
        biggestWin: isNewBestWin ? margin : undefined,
        biggestWinFor: isNewBestWin ? gf : undefined,
        biggestWinAgainst: isNewBestWin ? ga : undefined,
        currentStreak: streak,
        bestStreak: Math.max(existing?.bestStreak ?? 0, streak),
      },
    });
  };

  await upsertH2H(
    userId,
    opponentId,
    data.homeWon,
    data.isDraw,
    data.awayWon,
    data.homeScore,
    data.awayScore
  );
  await upsertH2H(
    opponentId,
    userId,
    data.awayWon,
    data.isDraw,
    data.homeWon,
    data.awayScore,
    data.homeScore
  );
}
