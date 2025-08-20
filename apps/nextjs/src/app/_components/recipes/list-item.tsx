import Image from "next/image";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { TableRow, TableCell } from "~/components/ui/table";
import type { RouterOutputs } from "~/trpc/react";

type Recipe = RouterOutputs["recipe"]["getAll"][number];

interface RecipeListItemProps {
  recipe: Recipe;
}

export function RecipeListItem({ recipe }: RecipeListItemProps) {
  const totalTime = (recipe.preparationTime ?? 0) + (recipe.cookingTime ?? 0);

  return (
    <TableRow>
      <TableCell className="font-medium">
        <Link href={`/app/recipes/${recipe.id}`} className="flex items-center">
          {recipe.image && recipe.image.length > 0 ? (
            <Image
              width={64}
              height={64}
              src={
                recipe.image && recipe.image.length > 0
                  ? recipe.image
                  : "https://via.placeholder.com/64x64?text=No+Image"
              }
              alt={recipe.name}
              className="me-4 inline-block h-16 w-16 rounded-md object-cover"
            />
          ) : (
            <div className="me-4 flex h-16 w-16 items-center justify-center rounded-md bg-gray-300 object-cover">
              <span className="p-4 text-center text-xs text-wrap text-gray-500">
                No Image
              </span>
            </div>
          )}
          <span className="align-middle">{recipe.name}</span>
        </Link>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {recipe.description?.substring(0, 70) ?? "N/A"}
        {recipe.description && recipe.description.length > 70 && "..."}
      </TableCell>
      <TableCell>{totalTime > 0 ? `${totalTime} min` : "N/A"}</TableCell>
      <TableCell className="text-right">{recipe.servings ?? "N/A"}</TableCell>
      <TableCell className="text-right">{recipe.calories ?? "N/A"}</TableCell>
      <TableCell className="text-center">
        {recipe.isPrivate ? (
          <Badge variant="destructive">Private</Badge>
        ) : (
          <Badge variant="outline">Public</Badge>
        )}
      </TableCell>
    </TableRow>
  );
}
