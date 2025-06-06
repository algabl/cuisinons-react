import { api, HydrateClient } from "~/trpc/server";
import { List } from "~/app/_components/recipes/list";
import type { Metadata } from "next";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { unauthorized } from "next/navigation";
import { auth } from "~/server/auth";

export const metadata: Metadata = {
  title: "Your Recipes",
};

export default async function RecipesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    unauthorized();
  }

  const recipes = await api.recipe.getByUserId({ userId: session.user.id });
  return (
    <HydrateClient>
      <main className="flex min-h-full flex-col">
        <Button asChild variant="outline">
          <Link href={"/app/recipes/create"}>
            <Plus />
            Create Recipe
          </Link>
        </Button>

        <List recipes={recipes} />
      </main>
    </HydrateClient>
  );
}
