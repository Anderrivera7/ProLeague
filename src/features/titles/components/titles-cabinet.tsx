import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Crown, Shield, Sparkles, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { resolveTrophyImage } from "@/lib/fc-data/league-trophies";
import {
  competitionLabel,
  recentTrophies,
  type TrophyWithTournament,
  uniqueClubs,
  uniqueCompetitions,
} from "@/features/titles/lib/title-utils";

interface TitlesCabinetProps {
  trophies: TrophyWithTournament[];
}

export function TitlesCabinet({ trophies }: TitlesCabinetProps) {
  const count = trophies.length;
  const clubs = uniqueClubs(trophies);
  const competitions = uniqueCompetitions(trophies);
  const latest = recentTrophies(trophies, 3);

  if (count === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border/80 bg-gradient-to-b from-card to-background px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Trophy className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-lg font-semibold">Vitrina vacía</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Gana un torneo ProLeague y el trofeo de esa competición, con el
          escudo de tu equipo, aparecerá aquí.
        </p>
        <Link
          href="/tournaments"
          className="mt-5 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Ir a torneos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-3 gap-2 sm:gap-3">
        <StatPill
          icon={<Crown className="h-4 w-4 text-primary" />}
          label="Títulos"
          value={count}
        />
        <StatPill
          icon={<Shield className="h-4 w-4 text-sky-400" />}
          label="Equipos"
          value={clubs}
        />
        <StatPill
          icon={<Sparkles className="h-4 w-4 text-amber-400" />}
          label="Ligas"
          value={competitions}
        />
      </section>

      <section className="overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-[#161616] via-[#101010] to-[#0b0b0b]">
        <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary/85">
              Recientes
            </p>
            <h2 className="truncate text-base font-semibold sm:text-lg">
              Últimas 3 jugadas
            </h2>
          </div>
          <Badge className="shrink-0 bg-primary/15 text-primary">
            {count} en total
          </Badge>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-3 sm:gap-4 sm:p-6">
          {latest.map((trophy, index) => (
            <FeaturedTrophyCard
              key={trophy.id}
              trophy={trophy}
              rank={index + 1}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold">Colección completa</h2>
          <p className="text-xs text-muted-foreground">
            Todos tus campeonatos con trofeo y escudo
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {trophies.map((trophy) => (
            <TitleCard key={trophy.id} trophy={trophy} />
          ))}
        </div>
      </section>
    </div>
  );
}

function StatPill({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/80 px-3 py-3 sm:px-4">
      <div className="mb-2 flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wide sm:text-[11px]">
          {label}
        </span>
      </div>
      <p className="text-2xl font-bold tabular-nums sm:text-3xl">{value}</p>
    </div>
  );
}

function FeaturedTrophyCard({
  trophy,
  rank,
}: {
  trophy: TrophyWithTournament;
  rank: number;
}) {
  const label = competitionLabel(trophy);
  const trophyUrl = resolveTrophyImage(
    trophy.imageUrl,
    trophy.tournament?.fcLeague?.fifaIndexId,
    label
  );

  return (
    <article className="group relative flex flex-col items-center rounded-2xl border border-border/70 bg-gradient-to-b from-white/[0.05] to-transparent px-3 pb-4 pt-5 text-center transition-colors hover:border-primary/40">
      <span className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
        #{rank}
      </span>

      {trophy.clubCrestUrl && (
        <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/95 p-1 shadow-lg">
          <Image
            src={trophy.clubCrestUrl}
            alt={trophy.clubName ?? "Escudo"}
            width={32}
            height={32}
            className="h-7 w-7 object-contain"
          />
        </div>
      )}

      <div className="relative mb-3 flex h-36 w-full items-end justify-center">
        <div className="pointer-events-none absolute bottom-2 h-8 w-28 rounded-[100%] bg-primary/20 blur-xl transition-colors group-hover:bg-primary/30" />
        {trophyUrl ? (
          <Image
            src={trophyUrl}
            alt={`Trofeo ${label}`}
            width={120}
            height={144}
            className="relative z-10 h-36 w-auto object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.65)] transition-transform duration-300 group-hover:-translate-y-1"
            unoptimized={trophyUrl.startsWith("http")}
          />
        ) : (
          <Trophy className="relative z-10 h-20 w-20 text-primary" />
        )}
      </div>

      <Badge className="mb-2 bg-primary text-primary-foreground">Campeón</Badge>
      <h3 className="line-clamp-2 px-1 text-sm font-semibold leading-snug">
        {label}
      </h3>
      {trophy.clubName && (
        <p className="mt-1 truncate px-2 text-xs text-muted-foreground">
          {trophy.clubName}
        </p>
      )}
    </article>
  );
}

function TitleCard({ trophy }: { trophy: TrophyWithTournament }) {
  const label = competitionLabel(trophy);
  const trophyUrl = resolveTrophyImage(
    trophy.imageUrl,
    trophy.tournament?.fcLeague?.fifaIndexId,
    label
  );

  return (
    <article className="group flex items-center gap-3 rounded-2xl border border-border bg-card/70 p-3 transition-colors hover:border-primary/30 hover:bg-card">
      <div className="relative flex h-20 w-16 shrink-0 items-end justify-center">
        <div className="pointer-events-none absolute bottom-1 h-4 w-12 rounded-[100%] bg-primary/15 blur-md" />
        {trophyUrl ? (
          <Image
            src={trophyUrl}
            alt={`Trofeo ${label}`}
            width={64}
            height={80}
            className="relative z-10 h-20 w-auto object-contain"
            unoptimized={trophyUrl.startsWith("http")}
          />
        ) : (
          <Trophy className="relative z-10 h-10 w-10 text-primary" />
        )}
        {trophy.clubCrestUrl && (
          <div className="absolute -bottom-0.5 -right-1 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background p-0.5 shadow-md">
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

      <div className="min-w-0 flex-1">
        <Badge
          variant="outline"
          className="mb-1.5 border-primary/30 bg-primary/10 text-[10px] text-primary"
        >
          Campeón
        </Badge>
        <h3 className="truncate text-sm font-semibold">{label}</h3>
        {trophy.clubName && (
          <p className="truncate text-xs text-muted-foreground">
            {trophy.clubName}
          </p>
        )}
        {trophy.tournament && (
          <Link
            href={`/tournaments/${trophy.tournament.id}`}
            className="mt-1 inline-block truncate text-[11px] text-primary hover:underline"
          >
            {trophy.tournament.name}
          </Link>
        )}
      </div>
    </article>
  );
}
