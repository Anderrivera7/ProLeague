import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { JoinCodeCard } from "@/features/tournaments/components/join-code-card";
import { TournamentRepository } from "@/repositories/tournament-repository";
import { getCurrentUser } from "@/actions/auth-actions";
import { getLeagueCoverUrl } from "@/lib/fc-data/club-ids";
import { CheckCircle2 } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ code?: string }>;
}

export default async function TournamentCreatedPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { code } = await searchParams;
  const [tournament, user] = await Promise.all([
    TournamentRepository.findById(id),
    getCurrentUser(),
  ]);

  if (!tournament || !user) notFound();
  if (tournament.creatorId !== user.id) redirect(`/tournaments/${id}`);

  const joinCode = tournament.joinCode ?? code ?? "—";
  const coverUrl = tournament.fcLeague
    ? getLeagueCoverUrl(tournament.fcLeague.fifaIndexId, tournament.fcLeague.name)
    : null;

  return (
    <>
      <Header title="¡Torneo creado!" subtitle={tournament.name} />
      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6 pb-24">
        {coverUrl && tournament.fcLeague && (
          <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverUrl}
              alt={tournament.fcLeague.name}
              className="aspect-[21/9] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="font-semibold">{tournament.fcLeague.name}</p>
            </div>
          </div>
        )}

        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>

        <div className="w-full max-w-md space-y-4">
          <JoinCodeCard joinCode={joinCode} tournamentName={tournament.name} />

          <Button className="w-full" asChild>
            <Link href={`/tournaments/${id}/select-team`}>
              Elegir mi equipo
            </Link>
          </Button>

          <Button variant="outline" className="w-full" asChild>
            <Link href={`/tournaments/${id}`}>Ir al torneo</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
