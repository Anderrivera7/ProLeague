import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth-actions";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { LastActiveTracker } from "@/components/layout/last-active-tracker";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        user={{
          nickname: user.nickname,
          avatarUrl: user.avatarUrl,
          elo: user.elo,
        }}
      />
      <div className="flex flex-1 flex-col">
        <LastActiveTracker />
        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col lg:max-w-none">
          {children}
        </div>
        <div className="lg:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
