import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Plus, UserPlus, Users } from "lucide-react";
import { getSessionUser } from "@/actions/auth-actions";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JoinCrewCard } from "@/features/crews/components/join-crew-card";
import { CrewService } from "@/services/crew-service";

export default async function CrewsPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  const { code } = await searchParams;
  const crews = await CrewService.listUserCrews(session.id);

  return (
    <>
      <Header
        title="Amigos"
        subtitle="Grupos privados para rivalizar"
      />
      <div className="mx-auto max-w-3xl space-y-5 px-3 py-4 sm:space-y-6 sm:px-4 lg:px-6 lg:py-6">
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#161616] via-[#101010] to-[#0b0b0b] sm:rounded-3xl">
          <div className="relative px-4 py-5 sm:px-7 sm:py-8">
            <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-primary/10 blur-3xl" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/85 sm:text-[11px]">
              Rivalidad social
            </p>
            <h2 className="mt-1.5 max-w-md text-lg font-semibold tracking-tight sm:mt-2 sm:text-2xl">
              Compite con tu grupo en títulos, descensos y goleadas
            </h2>
            <p className="mt-1.5 max-w-lg text-sm text-muted-foreground sm:mt-2">
              Crea un círculo, invita con código y mira quién manda en el podio.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-5">
              <Button asChild className="rounded-full">
                <Link href="/crews/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear grupo
                </Link>
              </Button>
              <Badge
                variant="outline"
                className="rounded-full px-3 py-1.5 text-muted-foreground"
              >
                {crews.length} {crews.length === 1 ? "grupo" : "grupos"}
              </Badge>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-end justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold">Tus grupos</h2>
              <p className="text-xs text-muted-foreground">
                Entra para ver los podios en vivo
              </p>
            </div>
            {crews.length > 0 && (
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="shrink-0 rounded-full text-primary"
              >
                <Link href="/crews/create">
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Nuevo
                </Link>
              </Button>
            )}
          </div>

          {crews.length > 0 ? (
            <div className="grid gap-2.5 sm:gap-3">
              {crews.map((crew) => (
                <Link
                  key={crew.id}
                  href={`/crews/${crew.id}`}
                  className="group flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-card/80 p-3.5 transition-all active:scale-[0.99] hover:border-primary/35 hover:bg-card sm:gap-4 sm:p-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary sm:h-12 sm:w-12">
                      <Users className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold group-hover:text-primary">
                        {crew.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {crew._count.members}{" "}
                        {crew._count.members === 1 ? "miembro" : "miembros"} ·{" "}
                        {crew.owner.nickname}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge
                      variant="outline"
                      className="hidden font-mono tracking-wider sm:inline-flex"
                    >
                      {crew.joinCode}
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border/80 bg-gradient-to-b from-card to-background px-5 py-12 text-center sm:rounded-3xl sm:px-6 sm:py-14">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Sin grupos todavía</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                Crea el primero y empieza a medir títulos, descensos y goleadas.
              </p>
              <Button asChild className="mt-5 rounded-full">
                <Link href="/crews/create">Crear mi grupo</Link>
              </Button>
            </div>
          )}
        </section>

        <section className="space-y-3 pb-2">
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <h2 className="text-base font-semibold">Unirse con código</h2>
              <p className="text-xs text-muted-foreground">
                Si un amigo ya creó el grupo, entra aquí
              </p>
            </div>
          </div>
          <JoinCrewCard defaultCode={code?.toUpperCase() ?? ""} />
        </section>
      </div>
    </>
  );
}
