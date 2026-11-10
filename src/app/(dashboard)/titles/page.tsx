import { redirect } from "next/navigation";
import { getSessionUser } from "@/actions/auth-actions";
import { Header } from "@/components/layout/header";
import { TitlesCabinet } from "@/features/titles/components/titles-cabinet";
import { BallonDorShelf } from "@/features/titles/components/ballon-dor-shelf";
import { GoldenBootShelf } from "@/features/titles/components/golden-boot-shelf";
import { sortTrophies } from "@/features/titles/lib/title-utils";
import { isBallonDorTitle } from "@/lib/awards/ballon-dor";
import { isGoldenBootTitle } from "@/lib/awards/golden-boot";
import { isIndividualAward } from "@/lib/awards/individual";
import { TrophyService } from "@/services/trophy-service";

export default async function TitlesPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  const all = await TrophyService.listForUser(session.id);
  const ballons = sortTrophies(all.filter((trophy) => isBallonDorTitle(trophy.title)));
  const boots = sortTrophies(all.filter((trophy) => isGoldenBootTitle(trophy.title)));
  const trophies = sortTrophies(
    all.filter((trophy) => !isIndividualAward(trophy.title))
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
        <BallonDorShelf awards={ballons} />
        <GoldenBootShelf boots={boots} />
        <TitlesCabinet trophies={trophies} />
      </div>
    </div>
  );
}
