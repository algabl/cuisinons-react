import { Skeleton } from "../ui/skeleton";

export function FormSkeleton({
  fields = 3,
  actions = 1,
}: {
  fields?: number;
  actions?: number;
}) {
  return (
    <div className="bg-card border-border mx-auto mt-4 w-full max-w-lg animate-pulse space-y-8 rounded-2xl border p-8 shadow">
      <div className="space-y-6">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-5 w-1/3 rounded" /> {/* Label */}
            <Skeleton className="h-10 w-full rounded" /> {/* Input */}
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-4">
        {Array.from({ length: actions }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-24 rounded" />
        ))}
      </div>
    </div>
  );
}
