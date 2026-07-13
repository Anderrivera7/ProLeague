import { recalculateAllUserPoints } from "../src/services/trophy-service";

async function main() {
  console.log("♻️ Recalculando puntos de todos los usuarios...");
  const results = await recalculateAllUserPoints();
  for (const r of results) {
    console.log(
      `  · ${r.nickname}: ${r.total} pts (partidos ${r.matchPoints} + logros ${r.achievementXp}, revocados ${r.revoked})`
    );
  }
  console.log("✅ Listo");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => process.exit(0));
