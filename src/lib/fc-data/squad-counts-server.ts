import { isClubEaId, parseClubEaId } from "./club-ids";
import { getClubCsvRows } from "./csv-club-importer";
import { getClubSquadFromRows } from "./csv-club-parser";
import { getCsvSquadForNationality } from "./csv-importer";
import {
  countFromRoles,
  type SquadCounts,
} from "./squad-count-types";

/** Plantilla esperada según CSV FC26 (solo servidor — usa fs) */
export function getExpectedSquadCounts(eaId: string): SquadCounts | null {
  if (isClubEaId(eaId)) {
    const clubId = parseClubEaId(eaId);
    if (clubId == null) return null;
    const squad = getClubSquadFromRows(getClubCsvRows(), clubId);
    if (squad.length === 0) return null;
    return countFromRoles(squad.map((p) => p.clubPosition));
  }

  const nationalityId = parseInt(eaId, 10);
  if (Number.isNaN(nationalityId)) return null;

  const squad = getCsvSquadForNationality(nationalityId);
  if (squad.length === 0) return null;
  return countFromRoles(squad.map((p) => p.nationPosition));
}
