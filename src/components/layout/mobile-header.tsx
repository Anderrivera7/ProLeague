"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationsBell } from "@/components/layout/notifications-bell";
import { useSidebarStore } from "@/stores/sidebar-store";

interface MobileHeaderProps {
  nickname: string;
}

export function MobileHeader({ nickname }: MobileHeaderProps) {
  const { setMobileOpen } = useSidebarStore();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between bg-background/90 px-4 py-4 backdrop-blur-md lg:hidden">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">
          ¡Hola, {nickname}!{" "}
          <span className="inline-block" aria-hidden>
            ⚽
          </span>
        </h1>
      </div>
      <NotificationsBell />
    </header>
  );
}
