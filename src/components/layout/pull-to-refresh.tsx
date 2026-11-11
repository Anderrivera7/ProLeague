"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const TRIGGER = 64;

/** Al estar arriba del todo, jalar hacia abajo vuelve a pedir los datos. */
export function PullToRefresh({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const scroller = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const armed = useRef(false);
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  function atTop() {
    return (scroller.current?.scrollTop ?? 0) <= 0;
  }

  function onTouchStart(event: React.TouchEvent) {
    if (refreshing || !atTop()) {
      armed.current = false;
      return;
    }
    startY.current = event.touches[0]?.clientY ?? 0;
    armed.current = true;
  }

  function onTouchMove(event: React.TouchEvent) {
    if (!armed.current || refreshing) return;
    if (!atTop()) {
      armed.current = false;
      setPull(0);
      return;
    }
    const dy = (event.touches[0]?.clientY ?? 0) - startY.current;
    if (dy <= 0) {
      setPull(0);
      return;
    }
    setPull(Math.min(dy * 0.45, 96));
  }

  function onTouchEnd() {
    if (!armed.current) return;
    armed.current = false;
    if (pull < TRIGGER) {
      setPull(0);
      return;
    }
    setRefreshing(true);
    setPull(48);
    router.refresh();
    window.setTimeout(() => {
      setRefreshing(false);
      setPull(0);
    }, 800);
  }

  return (
    <div
      ref={scroller}
      className={cn("relative", className)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      <div
        className="pointer-events-none sticky top-0 z-20 flex justify-center overflow-hidden text-[11px] font-medium uppercase tracking-[0.14em] text-amber-200"
        style={{ height: pull }}
        aria-hidden={pull === 0}
      >
        <span className="pt-3">
          {refreshing || pull >= TRIGGER ? "Actualizando" : "Suelta para actualizar"}
        </span>
      </div>
      <div style={{ transform: pull ? `translateY(${Math.min(pull, 28)}px)` : undefined }}>
        {children}
      </div>
    </div>
  );
}
