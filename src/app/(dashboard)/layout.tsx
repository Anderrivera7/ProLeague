import { redirect } from "next/navigation";
import { getSessionUser } from "@/actions/auth-actions";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { LastActiveTracker } from "@/components/layout/last-active-tracker";

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
    <div className="flex min-h-dvh bg-background">
      <Sidebar
        user={{
          nickname: user.nickname,
          avatarUrl: user.avatarUrl,
          elo: user.elo,
        }}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <LastActiveTracker />
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
          {children}
        </div>
        <div className="lg:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
