import { redirect, notFound } from "next/navigation";
import { getSessionUser } from "@/actions/auth-actions";
import { Header } from "@/components/layout/header";
import { CrewPodiumPanel } from "@/features/crews/components/crew-podium-panel";
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

  const podium = await CrewService.getPodium(id, session.id);
  if (!podium) notFound();

  const isOwner = crew.ownerId === session.id;

  return (
    <>
      <Header title={crew.name} subtitle="Podio de títulos del grupo" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <CrewActions
            crewId={crew.id}
            joinCode={crew.joinCode}
            isOwner={isOwner}
          />
          <CrewPodiumPanel entries={podium} crewName={crew.name} />
        </div>
      </div>
    </>
  );
}
