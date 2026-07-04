"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getMatchNotifications } from "@/actions/chat-actions";
import { formatDateTime } from "@/lib/utils";

interface Notification {
  id: string;
  content: string;
  createdAt: Date;
  tournamentId: string;
  tournament: { id: string; name: string };
}

export function NotificationsBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const toastedRef = useRef<Set<string>>(new Set());

  async function load() {
    try {
      const data = await getMatchNotifications();
      setNotifications(data as Notification[]);
      return data as Notification[];
    } catch {
      return [];
    }
  }

  useEffect(() => {
    load().then((data) => {
      const latest = data[0];
      if (!latest || toastedRef.current.has(latest.id)) return;
      const seen = sessionStorage.getItem(`notif-seen-${latest.id}`);
      if (seen) return;

      sessionStorage.setItem(`notif-seen-${latest.id}`, "1");
      toastedRef.current.add(latest.id);

      toast.info(`⚽ ${latest.content}`, {
        description: latest.tournament.name,
        action: {
          label: "Ver chat",
          onClick: () => router.push(`/chat/${latest.tournamentId}`),
        },
      });
    });

    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) load();
        }}
      >
        <Bell className="h-5 w-5" />
        {notifications.length > 0 && (
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
        )}
      </Button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-border bg-card shadow-xl">
            <div className="border-b border-border px-4 py-3">
              <p className="text-sm font-semibold">Notificaciones</p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                  Sin notificaciones
                </p>
              ) : (
                notifications.map((n) => (
                  <Link
                    key={n.id}
                    href={`/chat/${n.tournamentId}`}
                    onClick={() => setOpen(false)}
                    className="block border-b border-border/50 px-4 py-3 hover:bg-muted/50 transition-colors last:border-0"
                  >
                    <p className="text-xs font-medium text-primary">
                      {n.tournament.name}
                    </p>
                    <p className="mt-0.5 text-sm">⚽ {n.content}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {formatDateTime(n.createdAt)}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
