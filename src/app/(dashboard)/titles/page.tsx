import { redirect } from "next/navigation";
import { getSessionUser } from "@/actions/auth-actions";
import { Header } from "@/components/layout/header";
import { TitlesCabinet } from "@/features/titles/components/titles-cabinet";
import { sortTrophies } from "@/features/titles/lib/title-utils";
import { TrophyService } from "@/services/trophy-service";

export default async function TitlesPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  const trophies = sortTrophies(await TrophyService.listForUser(session.id));
  const count = trophies.length;

  return (
    <div className="flex min-h-full flex-col pb-24 lg:pb-8">
      <Header
        title="Títulos"
        subtitle={
          count === 0
            ? "Tu vitrina de campeonatos"
            : `${count} título${count === 1 ? "" : "s"} · vitrina profesional`
        }
      />

      <div className="mx-auto w-full max-w-5xl px-3 py-5 sm:px-4 lg:px-8">
        <TitlesCabinet trophies={trophies} />
      </div>
    </div>
  );
}
