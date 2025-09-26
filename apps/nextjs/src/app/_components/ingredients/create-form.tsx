"use client";

import type { z } from "zod/v4";

import type { Ingredient } from "@cuisinons/api/types";

import type { ingredientFormSchema } from "~/lib/validations";
import { api } from "~/trpc/react";
import IngredientForm from "./form";

export default function CreateForm({
  onSubmit,
  prefill,
}: {
  onSubmit?: (ingredient: Ingredient) => void;
  prefill?: Partial<z.infer<typeof ingredientFormSchema>>;
}) {
  const ingredientCreate = api.ingredient.create.useMutation();

  async function handleSubmit(
    ingredient: z.infer<typeof ingredientFormSchema>,
  ) {
    const response = await ingredientCreate.mutateAsync({
      name: ingredient.name,
      description: ingredient.description,
      emoji: ingredient.emoji,
    });
    if (onSubmit) {
      onSubmit(response.data as Ingredient);
    } else {
      // If no onSubmit callback is provided, redirect to the ingredient list
    }
  }

  return <IngredientForm onSubmit={handleSubmit} prefill={prefill} />;
}
