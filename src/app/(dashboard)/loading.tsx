import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLayoutLoading() {
  return (
    <div className="flex min-h-dvh bg-background">
      <div className="hidden w-64 shrink-0 border-r border-border lg:block">
        <div className="space-y-3 p-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
      <div className="flex-1 p-4">
        <Skeleton className="mb-4 h-10 w-48" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    </div>
  );
}
