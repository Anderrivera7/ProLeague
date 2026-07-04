"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn, formatDateTime, formatLastActive, getInitials } from "@/lib/utils";
import { sendChatMessage } from "@/actions/chat-actions";

interface ChatMessage {
  id: string;
  type: "USER" | "MATCH_RESULT" | "SYSTEM";
  content: string;
  createdAt: Date;
  user: {
    id: string;
    nickname: string;
    avatarUrl: string | null;
    lastActiveAt: Date | null;
  } | null;
}

interface Participant {
  user: {
    id: string;
    nickname: string;
    avatarUrl: string | null;
    lastActiveAt: Date | null;
  };
  fcTeam: { name: string } | null;
}

interface TournamentChatRoomProps {
  tournamentId: string;
  tournamentName: string;
  currentUserId: string;
  messages: ChatMessage[];
  participants: Participant[];
}

function normalizeMessage(msg: {
  id: string;
  type: "USER" | "MATCH_RESULT" | "SYSTEM";
  content: string;
  createdAt: Date | string;
  user: ChatMessage["user"];
}): ChatMessage {
  return {
    ...msg,
    createdAt:
      msg.createdAt instanceof Date ? msg.createdAt : new Date(msg.createdAt),
    user: msg.user
      ? {
          ...msg.user,
          lastActiveAt: msg.user.lastActiveAt
            ? msg.user.lastActiveAt instanceof Date
              ? msg.user.lastActiveAt
              : new Date(msg.user.lastActiveAt)
            : null,
        }
      : null,
  };
}

function mergeMessages(
  server: ChatMessage[],
  local: ChatMessage[]
): ChatMessage[] {
  const byId = new Map<string, ChatMessage>();
  for (const msg of server) byId.set(msg.id, msg);
  for (const msg of local) byId.set(msg.id, msg);
  return Array.from(byId.values()).sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );
}

export function TournamentChatRoom({
  tournamentId,
  tournamentName,
  currentUserId,
  messages: serverMessages,
  participants,
}: TournamentChatRoomProps) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = mergeMessages(
    serverMessages.map(normalizeMessage),
    localMessages
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 5000);
    return () => clearInterval(interval);
  }, [router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const content = text.trim();
    if (!content || isPending) return;

    startTransition(async () => {
      const result = await sendChatMessage(tournamentId, content);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      setText("");
      if (result.message) {
        setLocalMessages((prev) => [
          ...prev,
          normalizeMessage(result.message!),
        ]);
      }
      router.refresh();
    });
  }

  return (
    <div className="flex min-h-full flex-col">
      <div className="border-b border-border px-4 py-3">
        <h2 className="font-semibold">{tournamentName}</h2>
        <p className="text-xs text-muted-foreground">
          {participants.length} participantes
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-hidden lg:flex-row">
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 pb-28 lg:pb-4">
            {messages.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                Sé el primero en escribir. Los resultados de partidos aparecerán
                aquí automáticamente.
              </p>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.user?.id === currentUserId;
                const isSystem =
                  msg.type === "MATCH_RESULT" || msg.type === "SYSTEM";

                if (isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center">
                      <Badge
                        variant="secondary"
                        className="max-w-[90%] whitespace-normal text-center text-xs font-normal leading-relaxed"
                      >
                        ⚽ {msg.content}
                        <span className="ml-2 opacity-60">
                          {formatDateTime(msg.createdAt)}
                        </span>
                      </Badge>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-2",
                      isOwn ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                      {getInitials(msg.user?.nickname ?? "?")}
                    </div>
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-3 py-2 text-sm",
                        isOwn
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      {!isOwn && (
                        <p className="mb-0.5 text-[10px] font-semibold opacity-70">
                          {msg.user?.nickname}
                        </p>
                      )}
                      <p className="break-words">{msg.content}</p>
                      <p
                        className={cn(
                          "mt-1 text-[10px]",
                          isOwn
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        )}
                      >
                        {formatDateTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            className="sticky bottom-16 z-40 flex gap-2 border-t border-border bg-background p-4 lg:static lg:bottom-auto lg:z-auto"
          >
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escribe un mensaje..."
              maxLength={500}
              disabled={isPending}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isPending || !text.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>

        <aside className="hidden w-56 shrink-0 border-l border-border p-4 lg:block">
          <p className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
            Participantes
          </p>
          <div className="space-y-3">
            {participants.map((p) => (
              <div key={p.user.id} className="flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                  {getInitials(p.user.nickname)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {p.user.nickname}
                    {p.user.id === currentUserId && (
                      <span className="text-muted-foreground"> (tú)</span>
                    )}
                  </p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {p.fcTeam?.name ?? "Sin equipo"}
                  </p>
                  <p className="text-[10px] text-primary/80">
                    {formatLastActive(p.user.lastActiveAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <div className="border-t border-border px-4 py-3 pb-20 lg:hidden">
        <p className="mb-2 text-xs font-semibold text-muted-foreground">
          Participantes
        </p>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {participants.map((p) => (
            <div
              key={p.user.id}
              className="flex min-w-[120px] flex-col items-center rounded-lg bg-muted/40 px-3 py-2 text-center"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                {getInitials(p.user.nickname)}
              </div>
              <p className="mt-1 truncate text-xs font-medium w-full">
                {p.user.nickname}
              </p>
              <p className="text-[10px] text-primary/80">
                {formatLastActive(p.user.lastActiveAt)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
