import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export function CardSkeleton() {
  return (
    <Card hover={false} className="animate-pulse overflow-hidden pt-0">
      <div className="relative aspect-[5/3] w-full bg-gray-200">
        <Skeleton className="absolute inset-0 h-full w-full" />
        <div className="absolute top-2 right-2">
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="truncate">
          <Skeleton className="h-6 w-2/3" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="truncate">
          <Skeleton className="h-4 w-full" />
        </CardDescription>
      </CardContent>
    </Card>
  );
}

export function ListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="container flex px-4 py-16">
      <div className="grid w-full grid-cols-2 gap-4 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="bg-card flex min-h-[80vh] justify-center px-2 py-10">
      <div className="border-border bg-card w-full max-w-3xl rounded-3xl border shadow-lg">
        <div className="flex flex-col items-center gap-6 px-6 pt-6 pb-0">
          <div className="border-border mb-4 h-56 w-full overflow-hidden rounded-2xl border object-cover shadow">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="w-2/3">
            <Skeleton className="h-12 w-full rounded" />
          </div>
          <div className="w-full">
            <Skeleton className="h-8 w-full rounded" />
          </div>
        </div>
        <div className="space-y-10 px-6 pt-2 pb-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded" />
            ))}
          </div>
          <div>
            <div className="mb-4 w-1/3">
              <Skeleton className="h-8 w-full rounded" />
            </div>
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded" />
              ))}
            </div>
          </div>
          <div className="border-border mt-10 flex flex-col items-start gap-8 border-t pt-8 sm:flex-row sm:items-center">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex w-1/3 flex-col gap-2">
              <Skeleton className="h-6 w-full rounded" />
              <Skeleton className="h-4 w-2/3 rounded" />
              <Skeleton className="h-4 w-1/2 rounded" />
            </div>
            <div className="flex w-1/4 items-center gap-4 sm:ml-auto">
              <Skeleton className="h-10 w-20 rounded" />
              <Skeleton className="h-10 w-20 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
