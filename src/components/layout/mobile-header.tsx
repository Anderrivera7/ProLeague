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
    <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-border/60 bg-background/90 px-3 py-3 backdrop-blur-md supports-[backdrop-filter]:bg-background/75 sm:px-4 sm:py-4 lg:hidden">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="min-h-11 min-w-11 shrink-0"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="truncate text-lg font-bold sm:text-xl">
          ¡Hola, {nickname}!
        </h1>
      </div>
      <NotificationsBell />
    </header>
  );
}
