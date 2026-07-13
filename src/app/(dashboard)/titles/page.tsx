import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Crown, Trophy } from "lucide-react";
import { getSessionUser } from "@/actions/auth-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getLeagueTrophyUrl } from "@/lib/fc-data/league-trophies";
import { TrophyService } from "@/services/trophy-service";
import { formatTimeAgo } from "@/lib/utils";

export default async function TitlesPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  const trophies = await TrophyService.listForUser(session.id);

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-24">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Crown className="h-6 w-6 text-primary" />
          Títulos
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Trofeos ganados en torneos ProLeague. Cada campeonato aparece con el
          trofeo de su liga.
        </p>
      </div>

      {trophies.length === 0 ? (
        <Card className="glass">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Trophy className="h-10 w-10 text-muted-foreground" />
            <p className="font-medium">Aún no tienes títulos</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Gana la final de un torneo y el trofeo de esa competición
              (Premier, La Liga, Champions…) se mostrará aquí.
            </p>
            <Link
              href="/tournaments"
              className="mt-2 text-sm font-medium text-primary hover:underline"
            >
              Ver torneos
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {trophies.map((trophy) => {
            const league = trophy.tournament?.fcLeague;
            const trophyUrl = getLeagueTrophyUrl(
              league?.fifaIndexId,
              league?.name ?? trophy.tournament?.name
            );

            return (
              <Card key={trophy.id} className="glass overflow-hidden">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="relative flex h-24 w-20 shrink-0 items-end justify-center">
                    {trophyUrl ? (
                      <Image
                        src={trophyUrl}
                        alt={trophy.title}
                        width={80}
                        height={96}
                        className="h-24 w-auto object-contain drop-shadow-lg"
                        unoptimized
                      />
                    ) : (
                      <Trophy className="h-16 w-16 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="bg-primary/15 text-primary">
                        #{trophy.placement}
                      </Badge>
                      {trophy.seasonName && (
                        <Badge variant="outline">{trophy.seasonName}</Badge>
                      )}
                    </div>
                    <p className="truncate font-semibold">{trophy.title}</p>
                    {trophy.tournament && (
                      <Link
                        href={`/tournaments/${trophy.tournament.id}`}
                        className="block truncate text-sm text-muted-foreground hover:text-primary"
                      >
                        {trophy.tournament.name}
                      </Link>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(trophy.wonAt)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
