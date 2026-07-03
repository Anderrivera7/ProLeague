import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsRepository } from "@/repositories/stats-repository";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

export default async function RankingsPage() {
  const ranking = await StatsRepository.getEloRanking(50);

  return (
    <>
      <Header title="Rankings" subtitle="Ranking global por puntos" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <Card className="glass max-w-3xl">
          <CardHeader>
            <CardTitle>Ranking global por puntos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {ranking.map((player, i) => (
              <Link
                key={player.id}
                href={`/players/${player.id}`}
                className="flex items-center gap-4 rounded-lg p-3 hover:bg-card-hover transition-colors"
              >
                <span
                  className={`w-8 text-center font-mono font-bold ${
                    i < 3 ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </span>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={player.avatarUrl ?? undefined} />
                  <AvatarFallback>
                    {getInitials(player.nickname)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">{player.nickname}</p>
                  <p className="text-xs text-muted-foreground">
                    Nivel {player.level} · {player.stats?.wins ?? 0} victorias
                  </p>
                </div>
                <Badge variant="outline" className="font-mono text-base">
                  {player.elo}
                </Badge>
              </Link>
            ))}
            {ranking.length === 0 && (
              <p className="py-8 text-center text-muted-foreground">
                No hay jugadores en el ranking
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
