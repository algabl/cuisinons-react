import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Dropdown } from "~/app/_components/recipes/dropdown";
import { Button } from "~/components/ui/button";
import { MoreHorizontalIcon } from "lucide-react";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type Recipe = RouterOutputs["recipe"]["getAll"][number];

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Card className="overflow-hidden pt-0">
      <div className="relative aspect-[5/3] w-full bg-gray-200">
        <Link href={`/app/recipes/${recipe.id}`}>
          {recipe.image && recipe.image.length > 0 ? (
            <Image
              className="h-full w-full object-cover"
              src={recipe.image}
              alt={recipe.name}
              fill
              sizes="100vw, 500px"
              priority={false}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-300">
              <span className="text-gray-500">No Image</span>
            </div>
          )}
        </Link>
        <div className="absolute top-2 right-2">
          <Dropdown id={recipe.id}>
            <Button variant="secondary" size="icon">
              <MoreHorizontalIcon />
            </Button>
          </Dropdown>
        </div>
      </div>
      <CardHeader className="flex items-center justify-between">
        <Link href={`/app/recipes/${recipe.id}`}>
          <CardTitle className="truncate py-1">{recipe.name}</CardTitle>
        </Link>
      </CardHeader>
      <CardContent>
        <CardDescription className="truncate">
          {recipe.description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
