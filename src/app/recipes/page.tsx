import { HydrateClient } from "~/trpc/server";
import { Recipes } from "../_components/recipes";

export default async function RecipesPage() {
  return (
    <HydrateClient>
      <main className="flex min-h-screen">
        <Recipes />
      </main>
    </HydrateClient>
  );
}
