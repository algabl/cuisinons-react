"use client";

import { type z } from "zod";

import RecipeForm, { type formSchema } from "./form";
import { api } from "~/trpc/react";
import { redirect } from "next/navigation";

export function CreateForm() {

  const recipeCreate = api.recipe.create.useMutation();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const created = await recipeCreate.mutateAsync({
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
    redirect(`/app/recipes/${created.data}`);
  }

  return (
    <RecipeForm onSubmit={onSubmit} />
  );
}
