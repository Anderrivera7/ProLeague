"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getNotifications,
  markNotificationRead,
} from "@/actions/notification-actions";
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
};

const POLL_MS = 12_000;
const SEEN_KEY = "proleague-notif-anim-seen";

function getMeta(n: Notif): Record<string, unknown> {
  if (n.metadata && typeof n.metadata === "object" && !Array.isArray(n.metadata)) {
    return n.metadata as Record<string, unknown>;
  }
  return {};
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

/** Escucha notificaciones y reproduce solo la animación de campeón. */
export function NotificationRuntime() {
  const router = useRouter();
  const [activeAnim, setActiveAnim] = useState<NotificationActiveAnim | null>(
    null
  );

  useEffect(() => {
    let alive = true;

    async function tick() {
      if (typeof document !== "undefined" && document.hidden) return;
      try {
        const data = (await getNotifications()) as Notif[];
        if (!alive || !data.length) return;

        const next =
          data.find(
            (n) =>
              !n.readAt &&
              isAnimatableNotification(n.type, getMeta(n)) &&
              !wasAnimSeen(n.id)
          ) ??
          data.find(
            (n) =>
              isAnimatableNotification(n.type, getMeta(n)) && !wasAnimSeen(n.id)
          );
        if (!next) return;

        markAnimSeen(next.id);
        void markNotificationRead(next.id);
        const parsed = parseNotificationAnimation(next.type, getMeta(next));
        if (parsed) setActiveAnim(parsed);
      } catch {
        /* ignore */
      }
    }

    void tick();
    const interval = setInterval(() => void tick(), POLL_MS);
    const onVisibility = () => {
      if (!document.hidden) void tick();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      alive = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [router]);

  return (
    <NotificationAnimationHost
      active={activeAnim}
      onClose={() => setActiveAnim(null)}
    />
  );
}
