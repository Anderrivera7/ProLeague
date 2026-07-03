import type { NationalTeamCatalogEntry } from "./types";

/**
 * 28 selecciones nacionales licenciadas en EA FC 26
 * según la lista definida para ProLeague.
 * `nationalityId` = ID EA usado como `fifaIndexId` en la base de datos.
 */
export const FC26_WORLD_CUP_NATIONS: NationalTeamCatalogEntry[] = [
  { nationalityId: 52, nameEs: "Argentina", nameEn: "Argentina", licensed: true },
  { nationalityId: 10, nameEs: "Croacia", nameEn: "Croatia", licensed: true },
  { nationalityId: 12, nameEs: "República Checa", nameEn: "Czech Republic", licensed: true },
  { nationalityId: 13, nameEs: "Dinamarca", nameEn: "Denmark", licensed: true },
  { nationalityId: 14, nameEs: "Inglaterra", nameEn: "England", licensed: true },
  { nationalityId: 17, nameEs: "Finlandia", nameEn: "Finland", licensed: true },
  { nationalityId: 18, nameEs: "Francia", nameEn: "France", licensed: true },
  { nationalityId: 21, nameEs: "Alemania", nameEn: "Germany", licensed: true },
  { nationalityId: 117, nameEs: "Ghana", nameEn: "Ghana", licensed: true },
  { nationalityId: 34, nameEs: "Países Bajos", nameEn: "Holland", licensed: true },
  { nationalityId: 23, nameEs: "Hungría", nameEn: "Hungary", licensed: true },
  { nationalityId: 24, nameEs: "Islandia", nameEn: "Iceland", licensed: true },
  { nationalityId: 25, nameEs: "Irlanda", nameEn: "Republic of Ireland", licensed: true },
  { nationalityId: 27, nameEs: "Italia", nameEn: "Italy", licensed: true },
  { nationalityId: 83, nameEs: "México", nameEn: "Mexico", licensed: true },
  { nationalityId: 129, nameEs: "Marruecos", nameEn: "Morocco", licensed: true },
  { nationalityId: 35, nameEs: "Irlanda del Norte", nameEn: "Northern Ireland", licensed: true },
  { nationalityId: 36, nameEs: "Noruega", nameEn: "Norway", licensed: true },
  { nationalityId: 37, nameEs: "Polonia", nameEn: "Poland", licensed: true },
  { nationalityId: 38, nameEs: "Portugal", nameEn: "Portugal", licensed: true },
  { nationalityId: 182, nameEs: "Catar", nameEn: "Qatar", licensed: true },
  { nationalityId: 39, nameEs: "Rumanía", nameEn: "Romania", licensed: true },
  { nationalityId: 42, nameEs: "Escocia", nameEn: "Scotland", licensed: true },
  { nationalityId: 45, nameEs: "España", nameEn: "Spain", licensed: true },
  { nationalityId: 46, nameEs: "Suecia", nameEn: "Sweden", licensed: true },
  { nationalityId: 49, nameEs: "Ucrania", nameEn: "Ukraine", licensed: true },
  { nationalityId: 95, nameEs: "Estados Unidos", nameEn: "United States", licensed: true },
  { nationalityId: 50, nameEs: "Gales", nameEn: "Wales", licensed: true },
];

const LEGACY_EA_ID_MAP: Record<string, string> = {
  "1337": "18",
  "1338": "54",
  "1339": "52",
  "1340": "45",
  "1341": "21",
  "1342": "14",
  "1343": "38",
  "1344": "27",
  "1345": "34",
  "1346": "7",
  "1347": "60",
  "1348": "56",
  "1349": "83",
  "1350": "95",
  "1351": "163",
  "1352": "129",
};

export function getCatalogNation(nationalityId: number) {
  return FC26_WORLD_CUP_NATIONS.find((n) => n.nationalityId === nationalityId);
}

export function normalizeEaTeamId(eaId: string) {
  return LEGACY_EA_ID_MAP[eaId] ?? eaId;
}

export function isLicensedEaId(eaId: string) {
  const normalized = normalizeEaTeamId(eaId);
  return FC26_WORLD_CUP_NATIONS.some(
    (team) => String(team.nationalityId) === normalized
  );
}

export function searchCatalog(query: string, limit = 20) {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];

  return FC26_WORLD_CUP_NATIONS.filter(
    (n) =>
      n.nameEs.toLowerCase().includes(q) ||
      n.nameEn.toLowerCase().includes(q)
  ).slice(0, limit);
}

export function eaIdFromNationality(nationalityId: number) {
  return String(nationalityId);
}

export function parseEaId(eaId: string) {
  const id = parseInt(eaId, 10);
  return Number.isNaN(id) ? null : id;
}
