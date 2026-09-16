import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Crown, Trophy } from "lucide-react";
import { getSessionUser } from "@/actions/auth-actions";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { resolveTrophyImage } from "@/lib/fc-data/league-trophies";
import { TrophyService } from "@/services/trophy-service";

function competitionLabel(trophy: {
  title: string;
  tournament?: { name: string; fcLeague?: { name: string } | null } | null;
}) {
  const league = trophy.tournament?.fcLeague?.name;
  if (league) return league;
  return trophy.title.replace(/^Campeón\s*·\s*/i, "").trim() || "Competición";
}

export default async function TitlesPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  const trophies = await TrophyService.listForUser(session.id);
  const count = trophies.length;

  const sorted = [...trophies].sort((a, b) => {
    const clubCmp = (a.clubName || "").localeCompare(b.clubName || "", "es");
    if (clubCmp !== 0) return clubCmp;
    return competitionLabel(a).localeCompare(competitionLabel(b), "es", {
      sensitivity: "base",
    });
  });

  return (
    <div className="flex min-h-full flex-col pb-24 lg:pb-6">
      <Header
        title="Títulos"
        subtitle={
          count === 0
            ? "Tu vitrina de campeonatos"
            : `${count} título${count === 1 ? "" : "s"} ganado${count === 1 ? "" : "s"}`
        }
      />

      <div className="mx-auto w-full max-w-4xl space-y-5 px-3 py-4 sm:px-4 lg:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Crown className="h-4 w-4 text-primary" />
            Torneos ProLeague ganados · con escudo del equipo
          </p>
          {count > 0 && (
            <Badge className="bg-primary/15 px-3 py-1 text-sm text-primary">
              {count} en total
            </Badge>
          )}
        </div>

        {count === 0 ? (
          <Card className="glass">
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <Trophy className="h-12 w-12 text-muted-foreground" />
              <p className="font-medium">Aún no tienes títulos</p>
              <Link
                href="/tournaments"
                className="mt-2 text-sm font-medium text-primary hover:underline"
              >
                Ver torneos
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((trophy) => {
              const league = trophy.tournament?.fcLeague;
              const label = competitionLabel(trophy);
              const trophyUrl = resolveTrophyImage(
                trophy.imageUrl,
                league?.fifaIndexId,
                label
              );

              return (
                <Card key={trophy.id} className="glass overflow-hidden">
                  <CardContent className="relative flex flex-col items-center gap-3 p-4 pt-5 text-center">
                    {trophy.clubCrestUrl && (
                      <div className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card p-1 shadow-md">
                        <Image
                          src={trophy.clubCrestUrl}
                          alt={trophy.clubName ?? "Escudo"}
                          width={36}
                          height={36}
                          className="h-8 w-8 object-contain"
                        />
                      </div>
                    )}

                    <div className="relative flex h-32 w-28 items-end justify-center">
                      {trophyUrl ? (
                        <Image
                          src={trophyUrl}
                          alt={`Trofeo ${label}`}
                          width={112}
                          height={128}
                          className="h-32 w-auto object-contain drop-shadow-lg"
                          unoptimized={trophyUrl.startsWith("http")}
                        />
                      ) : (
                        <Trophy className="h-16 w-16 text-primary" />
                      )}
                    </div>

                    <Badge className="bg-primary/15 text-primary">Campeón</Badge>

                    <div className="min-w-0 space-y-1">
                      <p className="font-semibold leading-snug">{label}</p>
                      {trophy.clubName && (
                        <div className="flex items-center justify-center gap-1.5">
                          {trophy.clubCrestUrl && (
                            <Image
                              src={trophy.clubCrestUrl}
                              alt=""
                              width={16}
                              height={16}
                              className="h-4 w-4 object-contain"
                            />
                          )}
                          <p className="truncate text-sm text-muted-foreground">
                            {trophy.clubName}
                          </p>
                        </div>
                      )}
                      {trophy.tournament && (
                        <Link
                          href={`/tournaments/${trophy.tournament.id}`}
                          className="block truncate text-xs text-primary hover:underline"
                        >
                          {trophy.tournament.name}
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
