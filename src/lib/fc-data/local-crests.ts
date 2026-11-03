/** Escudos en /public/crests — siempre cargan sin proxy ni CDN. */
export const LOCAL_CREST_BY_CLUB_ID: Record<number, string> = {
  2: "/crests/pl-all-stars.png",
  9: "/crests/liverpool.png",
  11: "/crests/man-utd.png",
  44: "/crests/milan.png",
  179: "/crests/monaco.png",
  234: "/crests/benfica.png",
  236: "/crests/porto.png",
  241: "/crests/real-madrid.png",
  1876: "/crests/river-plate.png",
  111017: "/crests/universitario.png",
};

export const LOCAL_CREST_FILENAME_BY_CLUB_ID: Record<string, string> = {
  "9": "liverpool.png",
  "11": "man-utd.png",
  "234": "benfica.png",
  "236": "porto.png",
  "1041": "flamengo.png",
  "1876": "river-plate.png",
  "111017": "universitario.png",
};

/** Escudo estático generado por scripts/sync-club-crests.mjs */
export function cachedCrestPathForClubId(
  clubId: number | string | null | undefined
): string | null {
  if (clubId == null || clubId === "") return null;
  const n = typeof clubId === "number" ? clubId : parseInt(String(clubId), 10);
  if (Number.isNaN(n)) return null;
  return `/crests/cache/${n}.png`;
}

export function localCrestPathForClubId(
  clubId: number | string | null | undefined
): string | null {
  if (clubId == null || clubId === "") return null;
  const n = typeof clubId === "number" ? clubId : parseInt(String(clubId), 10);
  if (Number.isNaN(n)) return null;
  return LOCAL_CREST_BY_CLUB_ID[n] ?? null;
}
