import { Header } from "@/components/layout/header";
import { TournamentChatList } from "@/features/chat/components/tournament-chat-list";
import { ChatRepository } from "@/repositories/chat-repository";
import { getCurrentUser } from "@/actions/auth-actions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const tournaments = await ChatRepository.getEnrolledTournaments(user.id);

  return (
    <>
      <Header title="Chat" subtitle="Tus torneos" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 pb-24">
        <TournamentChatList tournaments={tournaments} />
      </div>
    </>
  );
}
