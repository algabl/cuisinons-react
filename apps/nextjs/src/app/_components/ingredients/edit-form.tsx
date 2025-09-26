"use client";

import type { z } from "zod/v4";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { Ingredient, ingredientSchema } from "@cuisinons/api/types";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { api } from "~/trpc/react";
import IngredientForm from "./form";

interface EditFormProps {
  prefill: Partial<Ingredient>;
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export default function EditForm({
  prefill,
  userId,
  open,
  onOpenChange,
}: EditFormProps) {
  const utils = api.useUtils();
  const router = useRouter();

  const ingredientUpdate = api.ingredient.update.useMutation({
    onMutate: async (newData) => {
      // Show optimistic toast
      toast.success("Updating ingredient...");
      onOpenChange(false);

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
                emoji: newData.emoji ?? null,
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
      router.refresh();
    },
    onSuccess: () => {
      // Show success toast
      toast.success("Ingredient updated successfully!");
    },
  });

  async function handleSubmit(ingredient: z.infer<typeof ingredientSchema>) {
    if (!prefill.id) throw new Error("No ID");

    try {
      const response = await ingredientUpdate.mutateAsync({
        id: prefill.id,
        name: ingredient.name,
        description: ingredient.description,
        emoji: ingredient.emoji,
      });
      if (!response.success) {
        throw new Error(response.message);
      }
    } catch (error) {
      // Error is already handled by the mutation's onError callback
      throw error;
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Ingredient</DialogTitle>
          <DialogDescription>
            Make changes to the ingredient details.
          </DialogDescription>
        </DialogHeader>
        <IngredientForm
          onSubmit={handleSubmit}
          isLoading={ingredientUpdate.isPending}
          prefill={{
            ...prefill,
            description: prefill.description ?? undefined,
            emoji: prefill.emoji ?? undefined,
          }}
          submitWrapper={(button) => (
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              {button}
            </DialogFooter>
          )}
        />
      </DialogContent>
    </Dialog>
  );
}
