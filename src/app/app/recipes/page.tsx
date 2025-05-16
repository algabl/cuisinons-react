import { HydrateClient } from "~/trpc/server";
import { Recipes } from "~/app/_components/recipes";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "~/components/ui/skeleton";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Recipes",
};

export default async function RecipesPage() {
  return (
    <HydrateClient>
      <main className="flex min-h-full flex-col">
        <Button asChild variant="outline">
          <Link href={"/app/recipes/create"}>
            <Plus />
            Create Recipe
          </Link>
        </Button>
        <Suspense fallback={<Skeleton />}>
          <Recipes />
        </Suspense>
      </main>
    </HydrateClient>
  );
}
