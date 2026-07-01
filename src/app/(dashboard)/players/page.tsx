import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserRepository } from "@/repositories/user-repository";
import { getInitials } from "@/lib/utils";

export default async function PlayersPage() {
  const players = await UserRepository.getLeaderboard(50);

  return (
    <>
      <Header title="Jugadores" subtitle="Explora la comunidad" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((player) => (
            <Link key={player.id} href={`/players/${player.id}`}>
              <Card className="glass hover:border-primary/30 transition-all cursor-pointer">
                <CardContent className="flex items-center gap-4 p-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={player.avatarUrl ?? undefined} />
                    <AvatarFallback>
                      {getInitials(player.nickname)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{player.nickname}</p>
                    <p className="text-xs text-muted-foreground">
                      {player.country ?? "—"} · Nivel {player.level}
                    </p>
                  </div>
                  <Badge variant="outline">{player.elo}</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        {players.length === 0 && (
          <Card className="glass">
            <CardContent className="py-12 text-center text-muted-foreground">
              No hay jugadores registrados
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
