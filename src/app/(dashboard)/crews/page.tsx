import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Plus, UserPlus, Users } from "lucide-react";
import { getSessionUser } from "@/actions/auth-actions";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JoinCrewCard } from "@/features/crews/components/join-crew-card";
import { CrewService } from "@/services/crew-service";

export default async function CrewsPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  const crews = await CrewService.listUserCrews(session.id);

  return (
    <>
      <Header
        title="Amigos"
        subtitle="Grupos privados para rivalizar entre ustedes"
      />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="mx-auto max-w-3xl space-y-8">
          <section className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-[#161616] via-[#101010] to-[#0b0b0b]">
            <div className="relative px-5 py-6 sm:px-7 sm:py-8">
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary/85">
                Rivalidad social
              </p>
              <h2 className="mt-2 max-w-md text-xl font-semibold tracking-tight sm:text-2xl">
                Compite con tu grupo en títulos, descensos y goleadas
              </h2>
              <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                Crea un círculo de amigos, invita con un código y mira quién
                manda en el podio.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button asChild className="rounded-full">
                  <Link href="/crews/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear grupo
                  </Link>
                </Button>
                <Badge variant="outline" className="rounded-full px-3 py-1.5">
                  {crews.length} {crews.length === 1 ? "grupo" : "grupos"}
                </Badge>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <div>
              <h2 className="text-base font-semibold">Tus grupos</h2>
              <p className="text-xs text-muted-foreground">
                Entra para ver los podios en vivo
              </p>
            </div>

            {crews.length > 0 ? (
              <div className="grid gap-3">
                {crews.map((crew) => (
                  <Link
                    key={crew.id}
                    href={`/crews/${crew.id}`}
                    className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-card/70 p-4 transition-all hover:border-primary/35 hover:bg-card"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary transition-transform duration-300 group-hover:scale-105">
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold group-hover:text-primary">
                          {crew.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
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
              <div className="rounded-3xl border border-dashed border-border/80 bg-gradient-to-b from-card to-background px-6 py-14 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Sin grupos todavía</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                  Crea el primero y empieza a medir títulos, descensos y las
                  mayores goleadas entre amigos.
                </p>
                <Button asChild className="mt-5 rounded-full">
                  <Link href="/crews/create">Crear mi grupo</Link>
                </Button>
              </div>
            )}
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-muted-foreground" />
              <div>
                <h2 className="text-base font-semibold">Unirse con código</h2>
                <p className="text-xs text-muted-foreground">
                  Si un amigo ya creó el grupo, entra aquí
                </p>
              </div>
            </div>
            <JoinCrewCard />
          </section>
        </div>
      </div>
    </>
  );
}
