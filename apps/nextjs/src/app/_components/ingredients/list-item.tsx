"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, MoreHorizontal, Package2, Trash2 } from "lucide-react";

import type { IngredientWithUsage as Ingredient } from "@cuisinons/api/types";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { TableCell, TableRow } from "~/components/ui/table";
import { DeleteIngredientDialog } from "./delete-dialog";
import EditForm from "./edit-form";

interface IngredientListItemProps {
  ingredient: Ingredient;
  userId: string;
}

export function IngredientListItem({
  ingredient,
  userId,
}: IngredientListItemProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">
          <div className="flex items-center">
            <div className="bg-muted me-4 flex h-12 w-12 items-center justify-center rounded-md">
              <Package2 className="text-muted-foreground h-6 w-6" />
            </div>
            <div>
              <div className="font-medium">{ingredient.name}</div>
              {ingredient.description && (
                <div className="text-muted-foreground text-sm">
                  {ingredient.description.substring(0, 50)}
                  {ingredient.description.length > 50 && "..."}
                </div>
              )}
            </div>
          </div>
        </TableCell>
        <TableCell>
          {ingredient.type ? (
            <Badge variant="outline" className="capitalize">
              {ingredient.type}
            </Badge>
          ) : (
            "N/A"
          )}
        </TableCell>
        <TableCell>
          <div className="flex flex-wrap gap-1">
            {ingredient.recipeIngredients.length > 0 ? (
              <>
                <Badge variant="secondary">
                  {ingredient.recipeIngredients.length} recipe
                  {ingredient.recipeIngredients.length !== 1 ? "s" : ""}
                </Badge>
                {ingredient.recipeIngredients.slice(0, 2).map((ri) => (
                  <Badge key={ri.recipe.id} variant="outline" asChild>
                    <Link href={`/app/recipes/${ri.recipe.id}`}>
                      {ri.recipe.name}
                    </Link>
                  </Badge>
                ))}
                {ingredient.recipeIngredients.length > 2 && (
                  <Badge variant="outline">
                    +{ingredient.recipeIngredients.length - 2} more
                  </Badge>
                )}
              </>
            ) : (
              <Badge variant="secondary">Unused</Badge>
            )}
          </div>
        </TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                variant="destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      <EditForm
        prefill={ingredient}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        userId={userId}
      />

      <DeleteIngredientDialog
        ingredient={ingredient}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  );
}
