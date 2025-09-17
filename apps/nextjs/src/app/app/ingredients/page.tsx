import type { Metadata } from "next";
import { unauthorized } from "next/navigation";

import { getCurrentUser } from "@cuisinons/auth/server";

import IngredientList from "~/app/_components/ingredients/list";
import { api, HydrateClient } from "~/trpc/server";

export const metadata: Metadata = {
  title: "Your Ingredients",
};

export default async function IngredientsPage() {
  const user = await getCurrentUser();
  if (!user?.id) {
    unauthorized();
  }

  // Prefetch the data for better UX
  await api.ingredient.getByUserId.prefetch(user.id);

  return (
    <HydrateClient>
      <main className="container mx-auto">
        Ingredients Page
        <IngredientList userId={user.id} />
      </main>
    </HydrateClient>
  );
}
