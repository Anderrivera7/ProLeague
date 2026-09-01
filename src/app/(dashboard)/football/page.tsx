import Link from "next/link";
import { redirect } from "next/navigation";
import { Globe } from "lucide-react";
import { getSessionUser } from "@/actions/auth-actions";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { RealLeagueStandings } from "@/features/football/components/real-league-standings";
import { RealMatchList } from "@/features/football/components/real-match-list";
import { FootballHighlights } from "@/features/football/components/football-highlights";
import { FEATURED_LEAGUES } from "@/lib/sports-apis/league-mapping";
import { RealFootballService } from "@/services/real-football-service";
import { cn } from "@/lib/utils";

export const revalidate = 1800;

export default async function FootballPage({
  searchParams,
}: {
  searchParams: Promise<{ league?: string }>;
}) {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  const { league: leagueParam } = await searchParams;
  const preferred = await RealFootballService.resolvePreferredLeagueId(
    session.id
  );
  const activeLeague = leagueParam ?? preferred ?? "13";

  const [snapshot, highlights] = await Promise.all([
    RealFootballService.getLeagueSnapshot(activeLeague, {
      standingsLimit: 10,
      eventsLimit: 5,
    }),
    RealFootballService.getHighlights(),
  ]);

  return (
    <>
      <Header
        title="Fútbol real"
        subtitle="Clasificaciones, partidos y highlights del mundo real"
      />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex flex-wrap gap-2">
            {FEATURED_LEAGUES.map((l) => (
              <Link key={l.fifaId} href={`/football?league=${l.fifaId}`}>
                <Badge
                  variant={activeLeague === l.fifaId ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer px-3 py-1.5",
                    activeLeague === l.fifaId && "bg-primary text-primary-foreground"
                  )}
                >
                  {l.label}
                </Badge>
              </Link>
            ))}
          </div>

          {snapshot ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <RealLeagueStandings
                leagueName={snapshot.leagueName}
                standings={snapshot.standings}
              />
              <div className="space-y-4">
                <RealMatchList
                  title="Próximos partidos"
                  events={snapshot.upcoming}
                  variant="upcoming"
                />
                <RealMatchList
                  title="Últimos resultados"
                  events={snapshot.recent}
                  variant="recent"
                />
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
              <Globe className="mx-auto mb-2 h-8 w-8" />
              Liga no disponible en TheSportsDB
            </div>
          )}

          <FootballHighlights highlights={highlights} />

          <p className="text-center text-xs text-muted-foreground">
            Datos de{" "}
            <a
              href="https://www.thesportsdb.com/api.php"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              TheSportsDB
            </a>
            {highlights.length > 0 && (
              <>
                {" "}
                · Highlights de{" "}
                <a
                  href="https://www.scorebat.com/video-api/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Scorebat
                </a>
              </>
            )}
          </p>
        </div>
      </div>
    </>
  );
}
