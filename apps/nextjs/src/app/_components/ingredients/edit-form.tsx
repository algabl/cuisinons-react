"use client";

import type { z } from "zod/v4";
import { toast } from "sonner";

import type { Ingredient, ingredientSchema } from "@cuisinons/api/types";

import { api } from "~/trpc/react";
import IngredientForm from "./form";

export default function EditForm({
  onSubmit,
  prefill,
  userId,
}: {
  onSubmit?: () => void;
  prefill: Ingredient;
  userId: string;
}) {
  const utils = api.useUtils();
  const ingredientUpdate = api.ingredient.update.useMutation({
    onMutate: async (newData) => {
      // Show optimistic toast
      toast.success("Updating ingredient...");

      // Cancel outgoing refetches to prevent overwriting optimistic update
      await utils.ingredient.getByUserId.cancel(userId);

      // Snapshot previous value for rollback
      const previousIngredients = utils.ingredient.getByUserId.getData(userId);

      // Optimistically update the cache
      utils.ingredient.getByUserId.setData(userId, (old) =>
        old?.map((ing) =>
          ing.id === newData.id
            ? {
                ...ing,
                name: newData.name,
                description: newData.description ?? null,
              }
            : ing,
        ),
      );

      return { previousIngredients };
    },
    onError: (err, newData, context) => {
      // Show error toast
      toast.error(`Failed to update ingredient: ${err.message}`);

      // Rollback on error
      if (context?.previousIngredients) {
        utils.ingredient.getByUserId.setData(
          userId,
          context.previousIngredients,
        );
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency with server
      utils.ingredient.getByUserId.invalidate(userId);
    },
    onSuccess: () => {
      // Show success toast
      toast.success("Ingredient updated successfully!");

      // Call the onSubmit callback to close dialog, etc.
      if (onSubmit) {
        onSubmit();
      }
    },
  });

  async function handleSubmit(ingredient: z.infer<typeof ingredientSchema>) {
    const response = await ingredientUpdate.mutateAsync({
      id: prefill.id,
      name: ingredient.name,
      description: ingredient.description,
    });
    if (!response.success) {
      throw new Error(response.message);
    }
  }

  return (
    <IngredientForm
      onSubmit={handleSubmit}
      isLoading={ingredientUpdate.isPending}
      prefill={{
        ...prefill,
        description: prefill.description ?? undefined,
      }}
    />
  );
}
