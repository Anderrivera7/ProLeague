import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local", override: true });

import { Prisma, PrismaClient } from "@prisma/client";
import { buildFc27Squad } from "../src/lib/fc-data/fc27-squads";
import { computeTeamStats } from "../src/lib/fc-data/ea-drop-client";
import type { ScrapedPlayerData } from "../src/lib/fc-data/types";

const prisma = new PrismaClient();

async function writeSquad(teamId: string, squad: ScrapedPlayerData[]) {
  const values = squad.map(
    (player) => Prisma.sql`(
      gen_random_uuid()::text,
      ${player.eaId},
      ${player.name},
      ${teamId},
      ${player.position ?? null},
      ${player.squadRole ?? null},
      ${player.jerseyNumber ?? null},
      ${player.overall ?? null},
      ${player.potential ?? null},
      ${player.nationality ?? null},
      ${player.imageUrl ?? null},
      ${player.pace ?? null},
      ${player.shooting ?? null},
      ${player.passing ?? null},
      ${player.dribbling ?? null},
      ${player.defending ?? null},
      ${player.physic ?? null},
      NOW(),
      NOW()
    )`
  );

  await prisma.$executeRaw`
    INSERT INTO fc_players (
      id, "fifaIndexId", name, "teamId", position, "squadRole", "jerseyNumber",
      overall, potential, nationality, "imageUrl",
      pace, shooting, passing, dribbling, defending, physic,
      "createdAt", "updatedAt"
    )
    VALUES ${Prisma.join(values)}
    ON CONFLICT ("fifaIndexId") DO UPDATE SET
      name = EXCLUDED.name,
      "teamId" = EXCLUDED."teamId",
      position = EXCLUDED.position,
      "squadRole" = EXCLUDED."squadRole",
      "jerseyNumber" = EXCLUDED."jerseyNumber",
      overall = EXCLUDED.overall,
      potential = EXCLUDED.potential,
      nationality = EXCLUDED.nationality,
      "imageUrl" = EXCLUDED."imageUrl",
      pace = EXCLUDED.pace,
      shooting = EXCLUDED.shooting,
      passing = EXCLUDED.passing,
      dribbling = EXCLUDED.dribbling,
      defending = EXCLUDED.defending,
      physic = EXCLUDED.physic,
      "updatedAt" = NOW()
  `;

  await prisma.$executeRaw`
    DELETE FROM fc_players AS player
    WHERE player."teamId" = ${teamId}
      AND player."fifaIndexId" NOT IN (${Prisma.join(squad.map((player) => player.eaId))})
      AND NOT EXISTS (
        SELECT 1 FROM match_player_stats AS stat
        WHERE stat."fcPlayerId" = player.id
      )
  `;
}

async function main() {
  const probes = [
    { name: "Real Madrid", fifaIndexId: "club:243" },
    { name: "FC Barcelona", fifaIndexId: "club:241" },
    { name: "Atlético Madrid", fifaIndexId: "club:240" },
    { name: "RSC Anderlecht", fifaIndexId: "club:229" },
    { name: "Francia", fifaIndexId: "18" },
    { name: "Países Bajos", fifaIndexId: "34" },
  ];
  for (const probe of probes) {
    const squad = buildFc27Squad(probe);
    console.log(probe.name, squad?.length ?? 0, squad?.[0]?.name, squad?.[0]?.overall);
    if (!squad?.length) throw new Error(`Sin plantilla FC27 para ${probe.name}`);
  }

  const renamed = await prisma.fcLeague.updateMany({
    where: { name: { contains: "FC26" } },
    data: { name: "Selecciones Nacionales FC27" },
  });
  console.log("leagues renamed", renamed.count);

  const teams = await prisma.fcTeam.findMany({
    select: { id: true, name: true, fifaIndexId: true },
    orderBy: { name: "asc" },
  });

  let updated = 0;
  const missed: string[] = [];
  for (const team of teams) {
    const squad = buildFc27Squad(team);
    if (!squad || squad.length === 0) {
      missed.push(`${team.fifaIndexId} ${team.name}`);
      continue;
    }
    await writeSquad(team.id, squad);
    const stats = computeTeamStats(squad);
    await prisma.fcTeam.update({
      where: { id: team.id },
      data: stats,
    });
    updated += 1;
    if (updated % 50 === 0) console.log("updated", updated);
  }

  console.log("updated", updated, "missed", missed.length);
  console.log(missed.slice(0, 40).join("\n"));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
