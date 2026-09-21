"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  clearAllNotifications,
  deleteNotification,
  getNotifications,
  markNotificationRead,
} from "@/actions/notification-actions";
import { formatDateTime, cn } from "@/lib/utils";
import {
  NotificationAnimationHost,
  isAnimatableNotification,
  parseNotificationAnimation,
  type NotificationActiveAnim,
} from "@/features/notifications/components/notification-animation-host";

type Notif = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  href: string | null;
  metadata: unknown;
  readAt: Date | null;
  createdAt: Date;
  deletable: boolean;
};

const POLL_MS = 15_000;
const SEEN_KEY = "proleague-notif-anim-seen";

function getMeta(n: Notif): Record<string, unknown> {
  if (n.metadata && typeof n.metadata === "object" && !Array.isArray(n.metadata)) {
    return n.metadata as Record<string, unknown>;
  }
  return {};
}

function shouldAnimate(n: Notif) {
  return isAnimatableNotification(n.type, getMeta(n));
}

export function NotificationsBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [pending, startTransition] = useTransition();
  const [activeAnim, setActiveAnim] = useState<NotificationActiveAnim | null>(
    null
  );
  const toastedRef = useRef<Set<string>>(new Set());

  async function load() {
    try {
      const data = (await getNotifications()) as Notif[];
      setNotifications(data);
      return data;
    } catch {
      return [];
    }
  }

  function markAnimSeen(id: string) {
    try {
      const raw = sessionStorage.getItem(SEEN_KEY);
      const set = new Set<string>(raw ? (JSON.parse(raw) as string[]) : []);
      set.add(id);
      sessionStorage.setItem(SEEN_KEY, JSON.stringify([...set].slice(-40)));
    } catch {
      /* ignore */
    }
  }

  function wasAnimSeen(id: string) {
    try {
      const raw = sessionStorage.getItem(SEEN_KEY);
      if (!raw) return false;
      return (JSON.parse(raw) as string[]).includes(id);
    } catch {
      return false;
    }
  }

  function maybePlayAnimation(list: Notif[]) {
    const next = list.find(
      (n) => shouldAnimate(n) && !wasAnimSeen(n.id) && !n.readAt
    );
    if (!next) return;

    markAnimSeen(next.id);
    void markNotificationRead(next.id);
    const parsed = parseNotificationAnimation(next.type, getMeta(next));
    if (parsed) setActiveAnim(parsed);
  }

  useEffect(() => {
    let active = true;

    async function fetchNotifications() {
      if (typeof document !== "undefined" && document.hidden) return [];
      try {
        const data = (await getNotifications()) as Notif[];
        if (!active) return [];
        setNotifications(data);
        return data;
      } catch {
        return [];
      }
    }

    fetchNotifications().then((data) => {
      if (!active || !data.length) return;
      maybePlayAnimation(data);

      const latest = data[0];
      if (!latest || toastedRef.current.has(latest.id)) return;
      if (sessionStorage.getItem(`notif-seen-${latest.id}`)) return;
      if (shouldAnimate(latest)) return;

      sessionStorage.setItem(`notif-seen-${latest.id}`, "1");
      toastedRef.current.add(latest.id);
      toast.info(latest.title, {
        description: latest.body ?? undefined,
        action: latest.href
          ? {
              label: "Ver",
              onClick: () => router.push(latest.href!),
            }
          : undefined,
      });
    });

    const interval = setInterval(() => {
      void fetchNotifications().then((data) => {
        if (data.length) maybePlayAnimation(data);
      });
    }, POLL_MS);

    const onVisibility = () => {
      if (!document.hidden) {
        void fetchNotifications().then((data) => {
          if (data.length) maybePlayAnimation(data);
        });
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      active = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteNotification(id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    });
  }

  function handleClearAll() {
    startTransition(async () => {
      await clearAllNotifications();
      setNotifications((prev) => prev.filter((n) => !n.deletable));
      toast.success("Notificaciones borradas");
    });
  }

  const unread = notifications.filter((n) => !n.readAt).length;

  return (
    <>
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="relative min-h-11 min-w-11"
          aria-label="Notificaciones"
          onClick={() => {
            setOpen((v) => !v);
            if (!open) void load();
          }}
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>

        {open && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 bg-black/50 lg:bg-transparent"
              aria-label="Cerrar"
              onClick={() => setOpen(false)}
            />
            <div className="fixed inset-x-3 bottom-20 z-50 max-h-[70vh] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl lg:absolute lg:inset-x-auto lg:bottom-auto lg:right-0 lg:top-12 lg:w-96">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <p className="text-sm font-semibold">Notificaciones</p>
                {notifications.some((n) => n.deletable) && (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={handleClearAll}
                    className="text-[11px] text-muted-foreground hover:text-destructive"
                  >
                    Borrar todas
                  </button>
                )}
              </div>
              <div className="max-h-[55vh] overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                    Sin notificaciones
                  </p>
                ) : (
                  notifications.map((n) => {
                    const important =
                      n.type === "RELEGATION" || n.type === "TITLE_SURPASSED";
                    const content = (
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "text-xs font-semibold",
                            n.type === "RELEGATION"
                              ? "text-red-400"
                              : n.type === "TITLE_SURPASSED"
                                ? "text-primary"
                                : "text-primary"
                          )}
                        >
                          {n.title}
                        </p>
                        {n.body && (
                          <p className="mt-0.5 text-sm text-foreground/90">
                            {n.body}
                          </p>
                        )}
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          {formatDateTime(n.createdAt)}
                        </p>
                      </div>
                    );

                    return (
                      <div
                        key={n.id}
                        className={cn(
                          "flex items-start gap-2 border-b border-border/50 px-3 py-3 last:border-0",
                          important && "bg-white/[0.02]",
                          !n.readAt && "bg-primary/[0.04]"
                        )}
                      >
                        {n.href ? (
                          <Link
                            href={n.href}
                            onClick={() => {
                              setOpen(false);
                              void markNotificationRead(n.id);
                            }}
                            className="min-w-0 flex-1"
                          >
                            {content}
                          </Link>
                        ) : (
                          content
                        )}
                        {n.deletable && (
                          <button
                            type="button"
                            aria-label="Borrar"
                            disabled={pending}
                            onClick={() => handleDelete(n.id)}
                            className="mt-0.5 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              <button
                type="button"
                className="flex w-full items-center justify-center gap-1 border-t border-border py-2 text-[11px] text-muted-foreground lg:hidden"
                onClick={() => setOpen(false)}
              >
                <X className="h-3 w-3" />
                Cerrar
              </button>
            </div>
          </>
        )}
      </div>

      <NotificationAnimationHost
        active={activeAnim}
        onClose={() => setActiveAnim(null)}
      />
    </>
  );
}
