import Link from "next/link";
import { ChevronRight, Globe } from "lucide-react";
import { RealLeagueStandings } from "./real-league-standings";
import { RealMatchList } from "./real-match-list";
import type { LeagueSnapshot } from "@/services/real-football-service";

interface Props {
  snapshot: LeagueSnapshot;
}

export function RealFootballWidget({ snapshot }: Props) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Globe className="h-4 w-4 text-primary" />
          Fútbol real · {snapshot.leagueName}
        </h2>
        <Link
          href="/football"
          className="flex items-center gap-0.5 text-xs text-primary"
        >
          Ver más ligas
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <RealLeagueStandings
          leagueName={snapshot.leagueName}
          standings={snapshot.standings}
          compact
        />
        <div className="space-y-3">
          <RealMatchList
            title="Próximos partidos"
            events={snapshot.upcoming}
            variant="upcoming"
          />
          {snapshot.recent.length > 0 && (
            <RealMatchList
              title="Últimos resultados"
              events={snapshot.recent.slice(0, 2)}
              variant="recent"
            />
          )}
        </div>
      </div>
    </section>
  );
}
