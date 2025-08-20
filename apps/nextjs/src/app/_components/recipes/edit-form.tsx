"use client";

import { redirect } from "next/navigation";
import { type Recipe } from "@cuisionons/api/types";
import RecipeForm from "./form";
import { api } from "~/trpc/react";
import { type RecipeFormData } from "~/lib/validations";

export default function EditForm({ recipe }: { recipe: Recipe }) {
  const recipeUpdate = api.recipe.update.useMutation();
  async function onSubmit(values: RecipeFormData) {
    console.log("what is going one");
    await recipeUpdate.mutateAsync({
      id: recipe.id,
      name: values.name,
      description: values.description,
      image: values.image,
      cookingTime: Number(values.cookingTime),
      preparationTime: Number(values.preparationTime),
      totalTime: Number(values.totalTime),
      servings: Number(values.servings),
      instructions: values.instructions,
      calories: Number(values.calories),
      fat: Number(values.fat),
      protein: Number(values.protein),
      carbohydrates: Number(values.carbohydrates),
      fiber: Number(values.fiber),
      sugar: Number(values.sugar),
      sodium: Number(values.sodium),

      recipeCategory: values.recipeCategory,
      recipeCuisine: values.recipeCuisine,
      keywords: values.keywords,
      difficulty: values.difficulty,
      skillLevel: values.skillLevel,
      suitableForDiet: values.suitableForDiet,
      recipeEquipment: values.recipeEquipment,
      estimatedCost: Number(values.estimatedCost),
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
