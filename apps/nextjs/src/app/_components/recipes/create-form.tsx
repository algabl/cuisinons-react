"use client";

import RecipeForm from "./form";
import { api } from "~/trpc/react";
import type { RecipeFormData } from "~/lib/validations";
import { useRouter } from "next/navigation";

export function CreateForm() {
  const recipeCreate = api.recipe.create.useMutation();

  const router = useRouter();

  async function onSubmit(values: RecipeFormData) {
    const created = await recipeCreate.mutateAsync({
      name: values.name,
      description: values.description,
      imageId: values.imageId,
      stageId: values.stageId,
      cookingTime: values.cookingTime,
      preparationTime: values.preparationTime,
      totalTime: values.totalTime,
      servings: values.servings,
      instructions: values.instructions,
      calories: values.calories,
      fat: values.fat,
      protein: values.protein,
      carbohydrates: values.carbohydrates,
      fiber: values.fiber,
      sugar: values.sugar,
      sodium: values.sodium,

      recipeCategory: values.recipeCategory,
      recipeCuisine: values.recipeCuisine,
      keywords: values.keywords,
      difficulty: values.difficulty,
      skillLevel: values.skillLevel,
      suitableForDiet: values.suitableForDiet,
      recipeEquipment: values.recipeEquipment,
      estimatedCost: values.estimatedCost,
      isPrivate: values.isPrivate,
      recipeIngredients: values.recipeIngredients.map((ingredient) => ({
        ingredientId: ingredient.ingredientId,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
      })),
    });
    router.push(`/app/recipes/${created.data}`);
    // redirect(`/app/recipes/${created.data}`);

  }

  return <RecipeForm onSubmit={onSubmit} isLoading={recipeCreate.isPending} />;
}
