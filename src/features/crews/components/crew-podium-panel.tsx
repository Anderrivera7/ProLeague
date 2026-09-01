import Image from "next/image";
import Link from "next/link";
import { Crown, Medal, Trophy, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLeagueTrophyUrl } from "@/lib/fc-data/league-trophies";
import { getInitials } from "@/lib/utils";
import type { CrewPodiumEntry } from "@/services/crew-service";
import { cn } from "@/lib/utils";

interface CrewPodiumPanelProps {
  entries: CrewPodiumEntry[];
  crewName: string;
}

const podiumHeights = ["h-28", "h-36", "h-24"] as const;
const podiumOrder = [1, 0, 2] as const;

function PodiumSlot({
  entry,
  heightClass,
}: {
  entry: CrewPodiumEntry | undefined;
  heightClass: string;
}) {
  if (!entry) {
    return <div className={cn("w-full", heightClass)} />;
  }

  const medalColors = {
    1: "text-yellow-400 border-yellow-400/40 bg-yellow-400/10",
    2: "text-zinc-300 border-zinc-400/40 bg-zinc-400/10",
    3: "text-amber-600 border-amber-600/40 bg-amber-600/10",
  } as const;

  const color =
    entry.rank <= 3
      ? medalColors[entry.rank as 1 | 2 | 3]
      : "text-muted-foreground border-border bg-muted/30";

  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      <div
        className={cn(
          "flex w-full flex-col items-center justify-end rounded-t-xl border-2 px-2 pb-3 pt-4 transition-all",
          heightClass,
          color,
          entry.isCurrentUser && "ring-2 ring-primary ring-offset-2 ring-offset-background"
        )}
      >
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 text-sm font-bold">
          {entry.rank === 1 ? (
            <Crown className="h-5 w-5 text-yellow-400" />
          ) : entry.rank === 2 ? (
            <Medal className="h-5 w-5 text-zinc-300" />
          ) : entry.rank === 3 ? (
            <Medal className="h-5 w-5 text-amber-600" />
          ) : (
            <span className="text-xs">#{entry.rank}</span>
          )}
        </div>
        <p className="max-w-full truncate text-center text-sm font-bold">
          {entry.nickname}
          {entry.isCurrentUser && (
            <span className="ml-1 text-[10px] text-primary">(tú)</span>
          )}
        </p>
        <p className="text-2xl font-black tabular-nums">
          {entry.titlesWon}
        </p>
        <p className="text-[10px] uppercase tracking-wide opacity-80">
          {entry.titlesWon === 1 ? "título" : "títulos"}
        </p>
      </div>
    </div>
  );
}

export function CrewPodiumPanel({ entries, crewName }: CrewPodiumPanelProps) {
  const topThree = entries.slice(0, 3);
  const rest = entries.slice(3);
  const currentUser = entries.find((e) => e.isCurrentUser);
  const leader = entries[0];

  return (
    <div className="space-y-6">
      {currentUser && leader && currentUser.userId !== leader.userId && (
        <Card className="glass border-primary/20">
          <CardContent className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="text-sm text-muted-foreground">Tu posición en el podio</p>
              <p className="font-semibold">
                #{currentUser.rank} · {currentUser.titlesWon}{" "}
                {currentUser.titlesWon === 1 ? "título" : "títulos"}
              </p>
            </div>
            <Badge variant="outline" className="text-primary">
              {leader.titlesWon - currentUser.titlesWon > 0
                ? `Te faltan ${leader.titlesWon - currentUser.titlesWon} para alcanzar a ${leader.nickname}`
                : "¡Lideras el podio!"}
            </Badge>
          </CardContent>
        </Card>
      )}

      {topThree.length > 0 && (
        <Card className="glass overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-4 w-4 text-primary" />
              Podio de títulos · {crewName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-center gap-2 px-2 pb-2">
              {podiumOrder.map((idx, i) => (
                <PodiumSlot
                  key={idx}
                  entry={topThree[idx]}
                  heightClass={podiumHeights[i]}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-base">Clasificación completa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.userId}
              className={cn(
                "rounded-lg border border-border p-3 transition-colors",
                entry.isCurrentUser && "border-primary/40 bg-primary/5"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-center font-mono text-sm text-muted-foreground">
                  {entry.rank}
                </span>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  {getInitials(entry.nickname)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/players/${entry.userId}`}
                      className="truncate font-medium hover:text-primary"
                    >
                      {entry.nickname}
                    </Link>
                    {entry.isOwner && (
                      <Badge variant="outline" className="text-[10px]">
                        Creador
                      </Badge>
                    )}
                    {entry.isCurrentUser && (
                      <Badge className="bg-primary/15 text-[10px] text-primary">
                        Tú
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {entry.wins} victorias · {entry.matchesPlayed} partidos ·{" "}
                    {entry.elo} pts
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Crown className="h-4 w-4 text-primary" />
                  <span className="text-lg font-bold tabular-nums">
                    {entry.titlesWon}
                  </span>
                </div>
              </div>

              {entry.recentTrophies.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2 pl-9">
                  {entry.recentTrophies.map((trophy) => {
                    const url = getLeagueTrophyUrl(
                      trophy.leagueFifaId,
                      trophy.leagueName
                    );
                    return (
                      <div
                        key={trophy.id}
                        className="flex items-center gap-1.5 rounded-md bg-muted/50 px-2 py-1"
                        title={trophy.title}
                      >
                        {url ? (
                          <Image
                            src={url}
                            alt={trophy.title}
                            width={20}
                            height={24}
                            className="h-5 w-auto object-contain"
                            unoptimized
                          />
                        ) : (
                          <Trophy className="h-4 w-4 text-primary" />
                        )}
                        <span className="max-w-[120px] truncate text-[10px] text-muted-foreground">
                          {trophy.title.replace("Campeón · ", "")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {entry.titlesWon === 0 && (
                <p className="mt-2 pl-9 text-xs text-muted-foreground">
                  Sin títulos todavía
                </p>
              )}
            </div>
          ))}

          {entries.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
              <User className="h-8 w-8" />
              <p className="text-sm">Invita compañeros para comparar títulos</p>
            </div>
          )}
        </CardContent>
      </Card>

      {rest.length > 0 && null}
    </div>
  );
}
