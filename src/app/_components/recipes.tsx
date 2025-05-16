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

export async function Recipes() {
  const recipes = await api.recipe.getAll();

  return (
    <div className="container flex px-4 py-16">
      <div className="grid w-full grid-cols-3 gap-4 sm:grid-cols-2 md:gap-8">
        {recipes.map((recipe) => (
          // <div
          //   key={recipe.id}
          //   className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
          // >
          //   <h3 className="text-2xl font-bold">{recipe.name}</h3>
          //   <p>{recipe.description}</p>
          // </div>
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
    <Link href={`/app/recipes/${recipe.id}`}>
      <Card className="h-60">
        <CardContent>
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
        </CardContent>
        <CardHeader>
          <CardTitle className="truncate">{recipe.name}</CardTitle>
          <CardDescription className="truncate">
            {recipe.description}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
