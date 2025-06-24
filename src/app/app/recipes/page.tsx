import { api, HydrateClient } from "~/trpc/server";
import { List } from "~/app/_components/recipes/list";
import type { Metadata } from "next";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { unauthorized } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export const metadata: Metadata = {
  title: "Your Recipes",
};

export default async function RecipesPage() {
  const session = await auth();
  if (!session?.userId) {
    unauthorized();
  }

  const recipes = await api.recipe.getAll();
  return (
    <HydrateClient>
      <main className="container mx-auto">
        <List recipes={recipes} />
      </main>
    </HydrateClient>
  );
}
