import { Suspense } from "react";
import { RealFootballWidget } from "@/features/football/components/real-football-widget";
import { RealFootballService } from "@/services/real-football-service";
import { Skeleton } from "@/components/ui/skeleton";

function FootballSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-5 w-48" />
      <div className="grid gap-3 lg:grid-cols-2">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    </div>
  );
}

async function RealFootballContent({ userId }: { userId: string }) {
  const leagueId = await RealFootballService.resolvePreferredLeagueId(userId);
  if (!leagueId) return null;

  const snapshot = await RealFootballService.getLeagueSnapshot(leagueId, {
    standingsLimit: 5,
    eventsLimit: 3,
  });

  if (!snapshot) return null;
  return <RealFootballWidget snapshot={snapshot} />;
}

export function RealFootballSection({ userId }: { userId: string }) {
  return (
    <Suspense fallback={<FootballSkeleton />}>
      <RealFootballContent userId={userId} />
    </Suspense>
  );
}
