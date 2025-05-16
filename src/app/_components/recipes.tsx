"use client";
import { api } from "~/trpc/react";

export function Recipes() {
  const [recipes] = api.recipe.getAll.useSuspenseQuery();

  return (
    <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
          >
            <h3 className="text-2xl font-bold">{recipe.name}</h3>
            <p>{recipe.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}