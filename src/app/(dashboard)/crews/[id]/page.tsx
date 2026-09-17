import { redirect, notFound } from "next/navigation";
import { getSessionUser } from "@/actions/auth-actions";
import { Header } from "@/components/layout/header";
import { CrewStatsBoard } from "@/features/crews/components/crew-stats-board";
import { CrewActions } from "@/features/crews/components/crew-actions";
import { CrewService } from "@/services/crew-service";

export default async function CrewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  const { id } = await params;
  const crew = await CrewService.getCrewForMember(id, session.id);
  if (!crew) notFound();

  const boardsData = await CrewService.getBoards(id, session.id);
  if (!boardsData) notFound();

  const isOwner = crew.ownerId === session.id;
  const memberCount = crew.members.length;

  return (
    <>
      <Header
        title={crew.name}
        subtitle="Arena · títulos · descensos · goleadas"
      />
      <div className="mx-auto max-w-3xl space-y-4 px-3 py-4 sm:space-y-5 sm:px-4 lg:px-6 lg:py-6">
        <CrewActions
          crewId={crew.id}
          joinCode={crew.joinCode}
          isOwner={isOwner}
          memberCount={memberCount}
        />
        <CrewStatsBoard
          boards={boardsData.boards}
          titlesDetail={boardsData.titlesDetail}
          crewName={crew.name}
          memberCount={memberCount}
        />
      </div>
    </>
  );
}
