import type { Trophy } from "@prisma/client";

export type TrophyWithTournament = Trophy & {
  tournament?: {
    id: string;
    name: string;
    type?: string;
    fcLeague?: {
      id?: string;
      name: string;
      fifaIndexId: string | null;
      logoUrl?: string | null;
      country?: string | null;
    } | null;
  } | null;
};

export function competitionLabel(trophy: TrophyWithTournament): string {
  const league = trophy.tournament?.fcLeague?.name;
  if (league) return league;
  return trophy.title.replace(/^Campeón\s*·\s*/i, "").trim() || "Competición";
}

export function sortTrophies(trophies: TrophyWithTournament[]) {
  return [...trophies].sort((a, b) => {
    const clubCmp = (a.clubName || "").localeCompare(b.clubName || "", "es");
    if (clubCmp !== 0) return clubCmp;
    return competitionLabel(a).localeCompare(competitionLabel(b), "es", {
      sensitivity: "base",
    });
  });
}

export function uniqueClubs(trophies: TrophyWithTournament[]) {
  return new Set(
    trophies.map((t) => t.clubName).filter((n): n is string => Boolean(n))
  ).size;
}

export function uniqueCompetitions(trophies: TrophyWithTournament[]) {
  return new Set(trophies.map((t) => competitionLabel(t))).size;
}
