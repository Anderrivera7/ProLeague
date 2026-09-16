import Image from "next/image";
import Link from "next/link";
import { Crown, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { resolveTrophyImage } from "@/lib/fc-data/league-trophies";
import {
  competitionLabel,
  sortTrophies,
  type TrophyWithTournament,
} from "@/features/titles/lib/title-utils";

interface TitlesShowcaseProps {
  trophies: TrophyWithTournament[];
}

export function TitlesShowcase({ trophies }: TitlesShowcaseProps) {
  if (trophies.length === 0) return null;

  const sorted = sortTrophies(trophies).slice(0, 8);

  return (
    <Card className="overflow-hidden border-border/80 bg-gradient-to-b from-card to-background">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border/50 pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Crown className="h-4 w-4 text-primary" />
          Vitrina · {trophies.length} título
          {trophies.length === 1 ? "" : "s"}
        </CardTitle>
        <Link
          href="/titles"
          className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
        >
          Ver todos ({trophies.length})
        </Link>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
          {sorted.map((trophy) => {
            const label = competitionLabel(trophy);
            const url = resolveTrophyImage(
              trophy.imageUrl,
              trophy.tournament?.fcLeague?.fifaIndexId,
              label
            );

            return (
              <Link
                key={trophy.id}
                href="/titles"
                className="group flex w-[5.5rem] shrink-0 flex-col items-center gap-2 rounded-2xl border border-transparent p-2 transition-colors hover:border-primary/25 hover:bg-card"
              >
                <div className="relative flex h-24 w-20 items-end justify-center">
                  <div className="pointer-events-none absolute bottom-1 h-4 w-12 rounded-[100%] bg-primary/20 blur-md" />
                  {url ? (
                    <Image
                      src={url}
                      alt={label}
                      width={80}
                      height={96}
                      className="relative z-10 h-24 w-auto object-contain transition-transform duration-300 group-hover:-translate-y-0.5"
                      unoptimized={url.startsWith("http")}
                    />
                  ) : (
                    <Trophy className="relative z-10 h-12 w-12 text-primary" />
                  )}
                  {trophy.clubCrestUrl && (
                    <div className="absolute -bottom-1 -right-1 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card p-0.5 shadow-md">
                      <Image
                        src={trophy.clubCrestUrl}
                        alt={trophy.clubName ?? ""}
                        width={24}
                        height={24}
                        className="h-5 w-5 object-contain"
                      />
                    </div>
                  )}
                </div>
                <p className="line-clamp-2 text-center text-[10px] leading-tight text-muted-foreground">
                  {trophy.clubName ?? label}
                </p>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
