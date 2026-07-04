import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationsBell } from "@/components/layout/notifications-bell";
import { TournamentChatRoom } from "@/features/chat/components/tournament-chat-room";
import { ChatRepository } from "@/repositories/chat-repository";
import { TournamentRepository } from "@/repositories/tournament-repository";
import { getCurrentUser } from "@/actions/auth-actions";

interface PageProps {
  params: Promise<{ tournamentId: string }>;
}

export default async function TournamentChatPage({ params }: PageProps) {
  const { tournamentId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [tournament, isParticipant, messages, participants] =
    await Promise.all([
      TournamentRepository.findById(tournamentId),
      ChatRepository.isParticipant(tournamentId, user.id),
      ChatRepository.getMessages(tournamentId),
      ChatRepository.getParticipants(tournamentId),
    ]);

  if (!tournament || !isParticipant) notFound();

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/chat">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <p className="font-semibold">{tournament.name}</p>
            <p className="text-xs text-muted-foreground">Chat del torneo</p>
          </div>
        </div>
        <NotificationsBell />
      </div>

      <div className="hidden lg:block">
        <div className="flex items-center gap-2 border-b border-border px-6 py-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/chat">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Torneos
            </Link>
          </Button>
        </div>
      </div>

      <TournamentChatRoom
        tournamentId={tournamentId}
        tournamentName={tournament.name}
        currentUserId={user.id}
        messages={messages}
        participants={participants}
      />
    </div>
  );
}
