import { type RouterOutputs } from "~/trpc/react";
import { RecipeCard } from "./card";

type Recipe = RouterOutputs["recipe"]["getAll"][number];

export function List({ recipes }: { recipes: Recipe[] }) {
  return (
    <div className="container flex py-16">
      <div className="grid w-full grid-cols-2 gap-4 lg:grid-cols-3">
        {recipes?.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}
