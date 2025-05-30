import { api } from "~/trpc/server";
import { auth } from "~/server/auth";

import { RecipeCard } from "./card";

export async function List() {
  const session = await auth();
  const recipes = session?.user.id
    ? await api.recipe.getByUserId({ userId: session.user.id })
    : [];

  return (
    <div className="container flex px-4 py-16">
      <div className="grid w-full grid-cols-2 gap-4 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}
