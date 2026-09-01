import Link from "next/link";
import { redirect } from "next/navigation";
import { Users, Plus, UserPlus } from "lucide-react";
import { getSessionUser } from "@/actions/auth-actions";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
        title="Compañeros"
        subtitle="Grupos privados para comparar títulos y podio"
      />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/crews/create">
                <Plus className="mr-2 h-4 w-4" />
                Crear grupo
              </Link>
            </Button>
          </div>

          {crews.length > 0 ? (
            <div className="grid gap-3">
              {crews.map((crew) => (
                <Link key={crew.id} href={`/crews/${crew.id}`}>
                  <Card className="glass transition-all hover:border-primary/30">
                    <CardContent className="flex items-center justify-between gap-4 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{crew.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {crew._count.members} miembros · Creado por{" "}
                            {crew.owner.nickname}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="font-mono">
                        {crew.joinCode}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="glass">
              <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                <Users className="h-10 w-10 text-muted-foreground" />
                <p className="font-medium">Aún no tienes grupos</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Crea un grupo con tus amigos del barrio, del trabajo o del
                  club. Veréis quién tiene más títulos en un podio en vivo.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="pt-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <UserPlus className="h-4 w-4" />
              ¿Tienes un código de invitación?
            </h2>
            <JoinCrewCard />
          </div>
        </div>
      </div>
    </>
  );
}
