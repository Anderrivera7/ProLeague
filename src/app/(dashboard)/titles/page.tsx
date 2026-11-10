import { redirect } from "next/navigation";
import { getSessionUser } from "@/actions/auth-actions";
import { Header } from "@/components/layout/header";
import { TitlesCabinet } from "@/features/titles/components/titles-cabinet";
import { GoldenBootShelf } from "@/features/titles/components/golden-boot-shelf";
import { sortTrophies } from "@/features/titles/lib/title-utils";
import { isGoldenBootTitle } from "@/lib/awards/golden-boot";
import { TrophyService } from "@/services/trophy-service";

export default async function TitlesPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  const all = await TrophyService.listForUser(session.id);
  const boots = sortTrophies(all.filter((trophy) => isGoldenBootTitle(trophy.title)));
  const trophies = sortTrophies(
    all.filter((trophy) => !isGoldenBootTitle(trophy.title))
  );
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

      <div className="mx-auto w-full max-w-5xl space-y-6 px-3 py-5 sm:px-4 lg:px-8">
        <GoldenBootShelf boots={boots} />
        <TitlesCabinet trophies={trophies} />
      </div>
    </div>
  );
}
