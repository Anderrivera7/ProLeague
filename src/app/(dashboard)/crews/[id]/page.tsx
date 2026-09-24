import { redirect, notFound } from "next/navigation";
import { getSessionUser } from "@/actions/auth-actions";
import { Header } from "@/components/layout/header";
import { CrewStatsBoard } from "@/features/crews/components/crew-stats-board";
import { CrewActions } from "@/features/crews/components/crew-actions";
import { CrewMembersStrip } from "@/features/crews/components/crew-members-strip";
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
  const titlesByUser = new Map(
    boardsData.titlesDetail.map((e) => [e.userId, e.titlesWon])
  );

  const members = crew.members.map((m) => {
    const lastTeam = m.user.participations[0]?.fcTeam;
    const fav = m.user.favoriteTeam;
    const team = lastTeam ?? fav;
    return {
      userId: m.user.id,
      nickname: m.user.nickname,
      avatarUrl: m.user.avatarUrl,
      elo: m.user.elo,
      titlesWon: titlesByUser.get(m.user.id) ?? m.user.stats?.titlesWon ?? 0,
      isOwner: m.user.id === crew.ownerId,
      teamName: team?.name ?? null,
      teamCrestUrl: team?.crestUrl ?? null,
      teamFifaIndexId: team?.fifaIndexId ?? null,
      fcTeamId: m.user.participations[0]?.fcTeamId ?? team?.id ?? null,
      tournamentId: m.user.participations[0]?.tournamentId ?? null,
    };
  });

  return (
    <>
      <Header
        title={crew.name}
        subtitle="Arena · comparar · títulos · descensos"
      />
      <div className="mx-auto max-w-3xl space-y-4 px-3 py-4 sm:space-y-5 sm:px-4 lg:px-6 lg:py-6">
        <CrewActions
          crewId={crew.id}
          joinCode={crew.joinCode}
          isOwner={isOwner}
          memberCount={memberCount}
        />
        <CrewMembersStrip currentUserId={session.id} members={members} />
        <CrewStatsBoard
          boards={boardsData.boards}
          titlesDetail={boardsData.titlesDetail}
          crewName={crew.name}
          memberCount={memberCount}
          currentUserId={session.id}
        />
      </div>
    </>
  );
}
