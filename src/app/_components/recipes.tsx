import { api } from "~/trpc/server";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { auth } from "~/server/auth";
import { Dropdown } from "./recipes/dropdown";
import { Button } from "~/components/ui/button";
import { MoreHorizontalIcon } from "lucide-react";

export async function Recipes() {
  const session = await auth();
  const recipes = session?.user.id
    ? await api.recipe.getByUserId({ userId: session.user.id })
    : [];

  return (
    <div className="container flex px-4 py-16">
      <div className="grid w-full grid-cols-3 gap-4 sm:grid-cols-2 md:gap-8">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}

type RouterOutputs = inferRouterOutputs<AppRouter>;
type Recipe = RouterOutputs["recipe"]["getAll"][number];

function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Card className="h-60 duration-200 hover:shadow-lg">
      <CardHeader className="flex items-center justify-between">
        <Link href={`/app/recipes/${recipe.id}`} className="min-w-0 flex-1">
          <CardTitle className="truncate">{recipe.name}</CardTitle>
        </Link>
        <Dropdown id={recipe.id}>
          <Button variant="ghost">
            <MoreHorizontalIcon />
          </Button>
        </Dropdown>
      </CardHeader>
      <CardContent>
        <Link href={`/app/recipes/${recipe.id}`}>
          <div className="h-30 w-full rounded-lg bg-gray-200">
            {recipe.image && (
              <Image
                className="h-full w-full rounded-lg object-cover"
                src={recipe.image}
                alt={recipe.name}
                width={500}
                height={300}
              />
            )}
          </div>
        </Link>
        <CardDescription className="truncate">
          {recipe.description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
