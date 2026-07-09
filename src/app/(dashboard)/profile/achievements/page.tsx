import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/actions/auth-actions";
import { AchievementRepository } from "@/repositories/achievement-repository";
import { AchievementsGrid } from "@/features/profile/components/achievements-grid";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default async function AchievementsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const achievements = await AchievementRepository.getProgressForUser(user.id);

  return (
    <div className="flex min-h-full flex-col pb-24">
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/profile">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-lg font-bold">Logros</h1>
      </div>

      <div className="px-4 py-6">
        <AchievementsGrid achievements={achievements} />
      </div>
    </div>
  );
}
