/**
 * Importa selecciones, ligas de clubes y clasificados UCL en orden correcto.
 * Uso: npm run seed:fc-all
 */

import { execSync } from "child_process";

const steps = [
  ["seed:fc-teams", "Selecciones nacionales"],
  ["seed:fc-clubs", "Ligas de clubes (1ª división)"],
  ["seed:fc-ucl", "UEFA Champions League 2026/27"],
] as const;

for (const [script, label] of steps) {
  console.log(`\n━━━ ${label} ━━━\n`);
  execSync(`npm run ${script}`, { stdio: "inherit", cwd: process.cwd() });
}

console.log("\n✅ Importación FC26 completa\n");
