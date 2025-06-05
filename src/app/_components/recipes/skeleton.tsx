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


