import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { List } from "~/app/_components/groups/list";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { HydrateClient } from "~/trpc/server";

export const metadata: Metadata = {
  title: "Your Groups",
};

export default async function GroupsPage() {
  return (
    <HydrateClient>
      <div className="flex min-h-full flex-col">
        <Button variant="outline" asChild>
          <Link href={"/app/groups/create"}>
            <Plus />
            Create Group
          </Link>
        </Button>
        {/* <Suspense fallback={<Skeleton />}> */}
        <List />
        {/* </Suspense> */}
      </div>
    </HydrateClient>
  );
}
