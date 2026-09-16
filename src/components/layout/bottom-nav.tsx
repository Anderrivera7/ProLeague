"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, Swords, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { BOTTOM_NAV_ITEMS } from "@/constants/navigation";

const iconMap = {
  Home,
  Trophy,
  Swords,
  MessageCircle,
  User,
};

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 pb-safe backdrop-blur-md supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-16 max-w-lg items-stretch justify-around px-1 sm:px-2">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap];
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground active:text-foreground"
              )}
            >
              <Icon
                className={cn("h-5 w-5", isActive && "drop-shadow-[0_0_6px_rgba(57,255,20,0.45)]")}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="max-w-full truncate text-[10px] font-medium leading-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
