import Link from "next/link";
import { ChevronRight, MessageCircle, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";

interface TournamentChatItem {
  tournamentId: string;
  name: string;
  status: string;
  teamName: string | null;
  participantsCount: number;
  lastMessage: {
    content: string;
    type: string;
    createdAt: Date;
    user: { nickname: string } | null;
  } | null;
}

interface TournamentChatListProps {
  tournaments: TournamentChatItem[];
}

export function TournamentChatList({ tournaments }: TournamentChatListProps) {
  if (tournaments.length === 0) {
    return (
      <Card className="glass">
        <CardContent className="flex flex-col items-center py-12 text-center">
          <MessageCircle className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="font-medium">No estás inscrito en ningún torneo</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Únete a un torneo para chatear con los participantes
          </p>
          <Link
            href="/tournaments/join"
            className="mt-4 text-sm font-medium text-primary"
          >
            Unirme con código →
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {tournaments.map((t) => (
        <Link key={t.tournamentId} href={`/chat/${t.tournamentId}`}>
          <Card className="glass transition-colors hover:border-primary/30">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-semibold">{t.name}</p>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {t.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {t.teamName ?? "Sin equipo"} · {t.participantsCount}{" "}
                  participantes
                </p>
                {t.lastMessage && (
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {t.lastMessage.type === "MATCH_RESULT" && "⚽ "}
                    {t.lastMessage.type === "USER" &&
                      t.lastMessage.user &&
                      `${t.lastMessage.user.nickname}: `}
                    {t.lastMessage.content}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                {t.lastMessage && (
                  <span className="text-[10px] text-muted-foreground">
                    {formatDateTime(t.lastMessage.createdAt)}
                  </span>
                )}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
