import { HydrateClient } from "~/trpc/server";
import { Recipes } from "../_components/recipes";
import type { Metadata } from "next";

 export const metadata: Metadata = {
    title: "Recipes"
  }

export default async function RecipesPage() {
  return (
    <HydrateClient>
      <main className="flex min-h-screen">
        <Recipes />
      </main>
    </HydrateClient>
  );
}
