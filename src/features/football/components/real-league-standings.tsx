import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SportsDbStanding } from "@/lib/sports-apis/thesportsdb-client";

interface Props {
  leagueName: string;
  standings: SportsDbStanding[];
  compact?: boolean;
}

export function RealLeagueStandings({
  leagueName,
  standings,
  compact,
}: Props) {
  if (standings.length === 0) {
    return (
      <Card className="glass">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Clasificación no disponible para {leagueName}
        </CardContent>
      </Card>
    );
  }

  const rows = compact ? standings.slice(0, 5) : standings;

  return (
    <Card className="glass overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          Clasificación real · {leagueName}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Datos en vivo vía{" "}
          <a
            href="https://www.thesportsdb.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            TheSportsDB
          </a>
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">Equipo</th>
                <th className="px-3 py-2 text-center">PJ</th>
                <th className="px-3 py-2 text-center">Pts</th>
                {!compact && <th className="px-3 py-2 text-center">DG</th>}
                <th className="px-3 py-2 text-center">Forma</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.team}
                  className="border-b border-border/50 transition-colors hover:bg-muted/30"
                >
                  <td className="px-3 py-2 font-mono text-muted-foreground">
                    {row.rank}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {row.badge && (
                        <Image
                          src={row.badge}
                          alt=""
                          width={20}
                          height={20}
                          className="h-5 w-5 object-contain"
                          unoptimized
                        />
                      )}
                      <span className="truncate font-medium">{row.team}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center tabular-nums">
                    {row.played}
                  </td>
                  <td className="px-3 py-2 text-center font-bold tabular-nums text-primary">
                    {row.points}
                  </td>
                  {!compact && (
                    <td className="px-3 py-2 text-center tabular-nums">
                      {row.goalDifference > 0 ? "+" : ""}
                      {row.goalDifference}
                    </td>
                  )}
                  <td className="px-3 py-2 text-center">
                    {row.form ? (
                      <span className="font-mono text-[10px] tracking-tighter text-muted-foreground">
                        {row.form}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
