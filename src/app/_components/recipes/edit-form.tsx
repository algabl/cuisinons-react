"use client";
import { type z } from "zod";

import { redirect } from "next/navigation";
import { type Recipe } from "~/server/api/types";
import RecipeForm, { type formSchema } from "./form";
import { api } from "~/trpc/react";

export default function EditForm({ recipe }: { recipe: Recipe }) {
  const recipeUpdate = api.recipe.update.useMutation();
  async function onSubmit(values: z.infer<typeof formSchema>) {
    await recipeUpdate.mutateAsync({
      id: recipe.id,
      name: values.name,
      description: values.description,
      image: values.image,
      cookingTime: Number(values.cookingTime),
      preparationTime: Number(values.preparationTime),
      servings: Number(values.servings),
      calories: Number(values.calories),
      instructions: values.instructions,
      isPrivate: values.isPrivate ?? true,
      recipeIngredients: values.recipeIngredients?.map((ingredient) => ({
        ingredientId: ingredient.ingredientId,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
      })),
    });
    redirect(`/app/recipes/${recipe.id}`);
  }

  return <RecipeForm recipe={recipe} onSubmit={onSubmit} />;
}
