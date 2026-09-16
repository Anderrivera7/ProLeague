import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardSectionLoading() {
  return (
    <div className="flex min-h-full flex-col pb-24 lg:pb-6">
      <div className="flex items-center justify-between border-b border-border/60 px-3 py-3 lg:hidden">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      <div className="mx-auto w-full max-w-5xl space-y-5 px-3 pt-4 sm:px-4 lg:px-8">
        <Skeleton className="h-5 w-28" />
        <div className="flex gap-3 overflow-hidden">
          <Skeleton className="h-36 w-[85%] shrink-0 rounded-2xl sm:w-72" />
          <Skeleton className="h-36 w-[85%] shrink-0 rounded-2xl sm:w-72" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    </div>
  );
}
