"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Trophy,
  Crown,
  Swords,
  BarChart3,
  TrendingUp,
  Users,
  User,
  UsersRound,
  Globe,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, APP_NAME } from "@/constants";
import { useSidebarStore } from "@/stores/sidebar-store";
import { Button } from "@/components/ui/button";
import { AppLogo } from "@/components/shared/app-logo";

const iconMap = {
  LayoutDashboard,
  Trophy,
  Crown,
  Swords,
  BarChart3,
  TrendingUp,
  Users,
  User,
  UsersRound,
  Globe,
};

interface SidebarProps {
  user?: { nickname: string; avatarUrl: string | null; elo: number } | null;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, toggle, setMobileOpen } = useSidebarStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isMobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isMobileOpen, setMobileOpen]);

  const collapsed = mounted ? isCollapsed : false;

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-3 border-b border-border px-4 sm:h-16">
        <AppLogo size={32} className="shrink-0" />
        <div
          className={cn(
            "min-w-0 overflow-hidden transition-opacity duration-200",
            collapsed ? "opacity-0 w-0" : "opacity-100"
          )}
        >
          <p className="truncate text-sm font-bold text-gradient">{APP_NAME}</p>
          <p className="text-xs text-muted-foreground">eSports Platform</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2 sm:p-3">
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap];
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-card-hover hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {user && !collapsed && (
        <div className="border-t border-border p-3 sm:p-4">
          <Link
            href="/profile"
            className="flex items-center gap-3 rounded-lg bg-card-hover p-3 transition-colors hover:bg-muted"
          >
            <UserAvatar
              nickname={user.nickname}
              avatarUrl={user.avatarUrl}
              size={36}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.nickname}</p>
              <p className="text-xs text-muted-foreground">Puntos {user.elo}</p>
            </div>
          </Link>
        </div>
      )}

      <div className="hidden border-t border-border p-3 lg:block">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggle}
          className="w-full justify-center"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Colapsar</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={cn(
          "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200 lg:flex",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        {sidebarContent}
      </aside>

      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <aside className="fixed left-0 top-0 z-50 flex h-dvh w-[min(100vw-3rem,16rem)] flex-col border-r border-border bg-card shadow-xl lg:hidden">
            <div className="flex justify-end p-2">
              <Button
                variant="ghost"
                size="icon"
                className="min-h-11 min-w-11"
                onClick={() => setMobileOpen(false)}
                aria-label="Cerrar menú"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
