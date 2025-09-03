import type { Metadata } from "next";
import Link from "next/link";
import { unauthorized } from "next/navigation";
import { getCurrentUser } from "@cuisinons/auth/server";
import { Plus } from "lucide-react";

import { List } from "~/app/_components/recipes/list";
import { Button } from "~/components/ui/button";
import { api, HydrateClient } from "~/trpc/server";

export const metadata: Metadata = {
  title: "Your Recipes",
};

export default async function RecipesPage() {
  const user = await getCurrentUser();
  if (!user?.id) {
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
