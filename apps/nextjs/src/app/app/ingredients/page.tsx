import type { Metadata } from "next";
import { unauthorized } from "next/navigation";

import { getCurrentUser } from "@cuisinons/auth/server";

import { IngredientsList } from "~/app/_components/ingredients/list";
import { api, HydrateClient } from "~/trpc/server";

export const metadata: Metadata = {
  title: "My Ingredients",
};

export default async function IngredientsPage() {
  const user = await getCurrentUser();
  if (!user?.id) {
    unauthorized();
  }

  // Prefetch and get the enhanced data for better UX
  const ingredients = await api.ingredient.getWithRecipeUsage(user.id);

  return (
    <HydrateClient>
      <main className="container mx-auto">
        <IngredientsList ingredients={ingredients} userId={user.id} />
      </main>
    </HydrateClient>
  );
}
