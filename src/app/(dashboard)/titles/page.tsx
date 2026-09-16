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
    <div className="mx-auto max-w-4xl space-y-6 px-3 pb-24 sm:px-4">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Crown className="h-6 w-6 text-primary" />
          Títulos
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Si ganas un torneo (p. ej. La Liga), recibes el trofeo de esa
          competición aquí.
        </p>
      </div>

      {trophies.length === 0 ? (
        <Card className="glass">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="relative h-28 w-24 opacity-40">
              <Image
                src="/trophies/la-liga.png"
                alt="Ejemplo trofeo La Liga"
                fill
                className="object-contain"
                sizes="96px"
              />
            </div>
            <p className="font-medium">Aún no tienes títulos</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Completa una liga o gana la final de un torneo ligado a una
              competición (La Liga, Premier, Champions…) y el trofeo aparecerá
              en tu vitrina.
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
              league?.name ?? trophy.tournament?.name ?? trophy.title
            );
            const competition =
              league?.name ?? trophy.tournament?.name ?? "Competición";

            return (
              <Card key={trophy.id} className="glass overflow-hidden">
                <CardContent className="flex flex-col items-center gap-3 p-5 text-center sm:flex-row sm:items-end sm:text-left">
                  <div className="relative flex h-36 w-28 shrink-0 items-end justify-center">
                    {trophyUrl ? (
                      <Image
                        src={trophyUrl}
                        alt={`Trofeo ${competition}`}
                        width={112}
                        height={144}
                        className="h-36 w-auto object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.55)]"
                        unoptimized={trophyUrl.startsWith("http")}
                        priority={false}
                      />
                    ) : (
                      <Trophy className="h-20 w-20 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                      <Badge className="bg-primary/15 text-primary">
                        Campeón
                      </Badge>
                      {trophy.seasonName && (
                        <Badge variant="outline">{trophy.seasonName}</Badge>
                      )}
                    </div>
                    <p className="font-semibold leading-snug">{trophy.title}</p>
                    <p className="text-sm text-muted-foreground">{competition}</p>
                    {trophy.tournament && (
                      <Link
                        href={`/tournaments/${trophy.tournament.id}`}
                        className="block truncate text-sm text-primary hover:underline"
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
