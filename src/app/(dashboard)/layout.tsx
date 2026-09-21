import { redirect } from "next/navigation";
import { getSessionUser } from "@/actions/auth-actions";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { LastActiveTracker } from "@/components/layout/last-active-tracker";
import { NotificationRuntime } from "@/features/notifications/components/notification-runtime";

/** Rutas autenticadas: usan cookies de Supabase, no pre-render estático. */
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <Sidebar
        user={{
          nickname: user.nickname,
          avatarUrl: user.avatarUrl,
          elo: user.elo,
        }}
      />
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <LastActiveTracker />
        <NotificationRuntime />
        <div className="mx-auto min-h-0 w-full max-w-6xl flex-1 overflow-y-auto overscroll-y-contain pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-6">
          {children}
        </div>
        <div className="lg:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
