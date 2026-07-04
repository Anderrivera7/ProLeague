import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TeamCrest } from "@/components/shared/team-crest";

interface TournamentMyTeamCardProps {
  tournamentId: string;
  teamName: string;
  teamCrestUrl?: string | null;
  teamFifaIndexId?: string | null;
  leagueLabel?: string | null;
}

export function TournamentMyTeamCard({
  tournamentId,
  teamName,
  teamCrestUrl,
  teamFifaIndexId,
  leagueLabel,
}: TournamentMyTeamCardProps) {
  return (
    <Card className="glass overflow-hidden border-primary/30">
      <CardContent className="p-0">
        <div className="flex min-h-[140px]">
          <div className="flex flex-1 flex-col justify-between p-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                Tu equipo
              </p>
              <div className="mt-2 flex items-center gap-3">
                <TeamCrest
                  name={teamName}
                  crestUrl={teamCrestUrl}
                  fifaIndexId={teamFifaIndexId ?? undefined}
                  size={40}
                />
                <div>
                  <p className="text-xl font-bold">{teamName}</p>
                  {leagueLabel && (
                    <p className="text-xs text-muted-foreground">{leagueLabel}</p>
                  )}
                </div>
              </div>
            </div>
            <Button asChild className="mt-4 w-fit">
              <Link href={`/tournaments/${tournamentId}/my-team`}>
                Ver plantilla
              </Link>
            </Button>
          </div>

          <div className="relative hidden w-36 shrink-0 sm:block">
            <div className="absolute inset-2 overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-b from-emerald-950/50 via-emerald-900/30 to-emerald-950/60">
              <div className="absolute inset-2 rounded-lg border border-white/10" />
              <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
              {[
                { top: "12%", left: "50%" },
                { top: "35%", left: "25%" },
                { top: "35%", left: "75%" },
                { top: "55%", left: "50%" },
                { top: "75%", left: "30%" },
                { top: "75%", left: "70%" },
              ].map((pos, i) => (
                <span
                  key={i}
                  className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/80 shadow-[0_0_6px] shadow-primary/50"
                  style={{ top: pos.top, left: pos.left }}
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
