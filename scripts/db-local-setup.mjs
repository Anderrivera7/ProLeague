import { execSync } from "node:child_process";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local", override: true });

const url = process.env.DATABASE_URL;
if (!url?.includes("127.0.0.1")) {
  console.error("[db:local:setup] Crea .env.local apuntando a Docker (puerto 55900).");
  process.exit(1);
}

execSync("docker compose up -d postgres", { stdio: "inherit" });
console.log("[db:local:setup] Esperando Postgres...");
await new Promise((r) => setTimeout(r, 8000));
execSync("npx prisma db push", { stdio: "inherit", env: process.env });
execSync("npm run db:seed", { stdio: "inherit", env: process.env });
console.log("[db:local:setup] Listo.");
