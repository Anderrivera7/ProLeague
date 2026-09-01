/**
 * Scorebat Football Videos API
 * https://www.scorebat.com/video-api/
 * Requiere token gratuito (registro en scorebat.com).
 */
export type ScorebatHighlight = {
  title: string;
  competition: string;
  matchviewUrl: string;
  thumbnail: string;
  date: string;
  videos: Array<{ title: string; embed: string }>;
};

export async function getFootballHighlights(
  limit = 6
): Promise<ScorebatHighlight[]> {
  const token = process.env.SCOREBAT_API_TOKEN?.trim();
  if (!token) return [];

  try {
    const res = await fetch(
      `https://www.scorebat.com/video-api/v3/feed/?token=${token}`,
      { next: { revalidate: 900 } }
    );
    if (!res.ok) return [];

    const data = (await res.json()) as {
      response?: Array<{
        title: string;
        competition: string;
        matchviewUrl: string;
        thumbnail: string;
        date: string;
        videos: Array<{ title: string; embed: string }>;
      }>;
    };

    return (data.response ?? []).slice(0, limit).map((item) => ({
      title: item.title,
      competition: item.competition,
      matchviewUrl: item.matchviewUrl,
      thumbnail: item.thumbnail,
      date: item.date,
      videos: item.videos ?? [],
    }));
  } catch {
    return [];
  }
}
