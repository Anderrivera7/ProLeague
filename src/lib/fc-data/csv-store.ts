import { existsSync, readFileSync } from "fs";
import path from "path";
import { parseFc26Csv, type Fc26CsvPlayer } from "./csv-parser";

let cachedRows: Fc26CsvPlayer[] | null = null;

export function resolveFc26CsvPath(): string {
  if (process.env.FC26_CSV_PATH && existsSync(process.env.FC26_CSV_PATH)) {
    return process.env.FC26_CSV_PATH;
  }

  const projectPath = path.join(process.cwd(), "data", "fc26-players.csv");
  if (existsSync(projectPath)) return projectPath;

  const downloadsPath = path.join(
    process.env.USERPROFILE ?? "",
    "Downloads",
    "FC26_20250921.csv"
  );
  if (existsSync(downloadsPath)) return downloadsPath;

  throw new Error(
    "No se encontró el CSV de FC26. Colócalo en data/fc26-players.csv o define FC26_CSV_PATH."
  );
}

export function loadFc26CsvRows(): Fc26CsvPlayer[] {
  if (cachedRows) return cachedRows;
  const csvPath = resolveFc26CsvPath();
  cachedRows = parseFc26Csv(readFileSync(csvPath, "utf8"));
  return cachedRows;
}
