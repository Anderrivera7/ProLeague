import { Skeleton } from "@/components/ui/skeleton";

export default function SelectTeamLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-5 p-4 lg:p-6">
      <Skeleton className="h-44 rounded-2xl" />
      <Skeleton className="h-11 rounded-lg" />
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
