"use client";

import { useRouter } from "next/navigation";

import type { Recipe } from "@cuisinons/api/types";

import type { RecipeFormData } from "~/lib/validations";
import { api } from "~/trpc/react";
import RecipeForm from "./form";
import { id } from "zod/v4/locales";

export default function EditForm({ recipe }: { recipe: Recipe }) {
  const recipeUpdate = api.recipe.update.useMutation();
  const router = useRouter();
  async function onSubmit(values: RecipeFormData) {
    await recipeUpdate.mutateAsync({
      id: recipe.id,
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
    router.push(`/app/recipes/${recipe.id}`);
    // redirect(`/app/recipes/${recipe.id}`);
    return { id: recipe.id };
  }

  return (
    <RecipeForm
      recipe={recipe}
      onSubmit={onSubmit}
      isLoading={recipeUpdate.isPending}
    />
  );
}
