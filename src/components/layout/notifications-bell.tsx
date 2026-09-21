"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
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

export function NotificationsBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [pending, startTransition] = useTransition();
  const toastedRef = useRef<Set<string>>(new Set());

  useEffect(() => setMounted(true), []);

  async function load() {
    try {
      const data = (await getNotifications()) as Notif[];
      setNotifications(data);
      return data;
    } catch {
      setNotifications([]);
      return [] as Notif[];
    }
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    let active = true;
    void load().then((data) => {
      if (!active || !data.length) return;
      const latest = data[0];
      if (!latest || toastedRef.current.has(latest.id)) return;
      if (sessionStorage.getItem(`notif-seen-${latest.id}`)) return;
      const meta =
        latest.metadata &&
        typeof latest.metadata === "object" &&
        !Array.isArray(latest.metadata)
          ? (latest.metadata as Record<string, unknown>)
          : {};
      // Solo el campeón recibe toast/animación de título.
      if (meta.animate === true && meta.kind === "CHAMPION") return;

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
    return () => {
      active = false;
    };
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

  const panel =
    open && mounted
      ? createPortal(
          <>
            <button
              type="button"
              className="fixed inset-0 z-[180] bg-black/50"
              aria-label="Cerrar"
              onClick={() => setOpen(false)}
            />
            <div className="fixed inset-x-3 top-16 z-[190] max-h-[min(70vh,520px)] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl sm:inset-x-auto sm:right-4 sm:top-16 sm:w-96 lg:right-6">
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
              <div className="max-h-[min(55vh,420px)] overflow-y-auto overscroll-contain">
                {notifications.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Sin notificaciones
                  </p>
                ) : (
                  notifications.map((n) => {
                    const content = (
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-primary">
                          {n.title}
                        </p>
                        {n.body && (
                          <p className="mt-0.5 text-sm leading-snug text-foreground">
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
                          !n.readAt && "bg-primary/[0.06]"
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
                          <button
                            type="button"
                            className="min-w-0 flex-1 text-left"
                            onClick={() => {
                              void markNotificationRead(n.id);
                              setNotifications((prev) =>
                                prev.map((x) =>
                                  x.id === n.id
                                    ? { ...x, readAt: new Date() }
                                    : x
                                )
                              );
                            }}
                          >
                            {content}
                          </button>
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
                className="flex w-full items-center justify-center gap-1 border-t border-border py-2.5 text-[11px] text-muted-foreground sm:hidden"
                onClick={() => setOpen(false)}
              >
                <X className="h-3 w-3" />
                Cerrar
              </button>
            </div>
          </>,
          document.body
        )
      : null;

  return (
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
      {panel}
    </div>
  );
}
