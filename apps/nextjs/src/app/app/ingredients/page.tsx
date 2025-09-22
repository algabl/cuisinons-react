import type { Metadata } from "next";
import { unauthorized } from "next/navigation";

import { getCurrentUser } from "@cuisinons/auth/server";

import { IngredientsList } from "~/app/_components/ingredients/list";
import { api, HydrateClient } from "~/trpc/server";

export const metadata: Metadata = {
  title: "Your Ingredients",
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
      <main className="container mx-auto p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              My Ingredients
            </h1>
            <p className="text-muted-foreground">
              Manage your ingredients and see which recipes use them.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <IngredientsList ingredients={ingredients} userId={user.id} />
        </div>
      </main>
    </HydrateClient>
  );
}
