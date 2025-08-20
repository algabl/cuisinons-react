import { ListSkeleton } from "~/app/_components/recipes/skeleton";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="flex min-h-full flex-col">
      <Button asChild variant="outline" disabled>
        <span className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-24 rounded" />
        </span>
      </Button>
      <ListSkeleton />
    </main>
  );
}
