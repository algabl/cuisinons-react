"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import type { IngredientWithUsage as Ingredient } from "@cuisinons/api/types";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";

interface DeleteIngredientDialogProps {
  ingredient: Ingredient;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteIngredientDialog({
  ingredient,
  open,
  onOpenChange,
}: DeleteIngredientDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const utils = api.useUtils();

  const deleteIngredient = api.ingredient.delete.useMutation({
    onSuccess: async () => {
      await utils.ingredient.getWithRecipeUsage.invalidate();
      onOpenChange(false);
    },
  });

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteIngredient.mutateAsync(ingredient.id);
    } catch (error) {
      console.error("Failed to delete ingredient:", error);
    } finally {
      setIsDeleting(false);
    }
  }

  const hasRecipeUsage = ingredient.recipeIngredients.length > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="text-destructive h-5 w-5" />
            Delete Ingredient
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{ingredient.name}</span>?
            </p>
            {hasRecipeUsage && (
              <div className="bg-destructive/10 rounded-md p-3">
                <p className="text-destructive text-sm font-medium">
                  ⚠️ This ingredient is used in{" "}
                  {ingredient.recipeIngredients.length} recipe
                  {ingredient.recipeIngredients.length !== 1 ? "s" : ""}:
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {ingredient.recipeIngredients.map((ri) => (
                    <Link
                      key={ri.recipe.id}
                      href={`/app/recipes/${ri.recipe.id}`}
                    >
                      <Badge variant="outline" className="text-xs">
                        {ri.recipe.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
                <p className="text-muted-foreground mt-2 text-xs">
                  You must remove the ingredient from these recipes before
                  deleting this ingredient.
                </p>
              </div>
            )}
            <p className="text-muted-foreground text-sm">
              This action cannot be undone.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting || hasRecipeUsage}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
