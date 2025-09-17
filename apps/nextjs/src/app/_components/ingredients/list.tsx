"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

import type { Ingredient } from "@cuisinons/api/types";

import EditForm from "~/app/_components/ingredients/edit-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { api } from "~/trpc/react";

export default function IngredientList({ userId }: { userId: string }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] =
    useState<Ingredient | null>(null);

  // Use tRPC query instead of local state
  const { data: ingredients = [], isLoading } =
    api.ingredient.getByUserId.useQuery(userId);

  const dialogNode = (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Ingredient</DialogTitle>
          {selectedIngredient && (
            <EditForm
              prefill={selectedIngredient}
              userId={userId}
              onSubmit={() => {
                setIsDialogOpen(false);
                setSelectedIngredient(null);
              }}
            />
          )}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );

  if (isLoading) {
    return <div>Loading ingredients...</div>;
  }

  return (
    <>
      <ul>
        {ingredients.map((ingredient) => (
          <li
            onClick={() => {
              setSelectedIngredient(ingredient);
              setIsDialogOpen(true);
            }}
            key={ingredient.id}
            className="cursor-pointer rounded p-2 hover:bg-gray-100"
          >
            {ingredient.name}
          </li>
        ))}
      </ul>
      {typeof window !== "undefined" && createPortal(dialogNode, document.body)}
    </>
  );
}
