import Image from "next/image";
import Link from "next/link";
import { notFound, unauthorized } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";

import { generateRecipeJsonLd, recipeToSchemaOrg } from "@cuisinons/validators";

import { ShareItems } from "~/app/_components/recipes/share-items";
import { CookingMode } from "~/components/cooking-mode";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { api } from "~/trpc/server";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const recipe = await api.recipe.getById({ id });

  if (!recipe) {
    return {
      title: "Recipe Not Found",
      description: "The requested recipe does not exist.",
    };
  }

  return {
    title: `${recipe.name} | Cuisinons`,
    description: recipe.description ?? "No description provided.",
    openGraph: {
      title: `${recipe.name} | Cuisinons`,
      description: recipe.description ?? "No description provided.",
      images: recipe.image ? [recipe.image] : [],
    },
  };
}

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const session = await auth();
  const recipe = await api.recipe.getById({ id });

  if (!recipe) {
    notFound();
  }

  const isPublicRecipe = recipe.isPrivate === false;
  const isOwner = session.userId === recipe.createdById;

  if (!isPublicRecipe && !isOwner) {
    let user = null;
    if (session.userId) {
      user = await api.user.getById(session.userId);
    }
    if (!user) {
      unauthorized();
    }
    const isInGroup = recipe.recipeSharings.some((sharing) =>
      user.groupMembers.some(
        (groupMember) => sharing.groupId === groupMember.groupId,
      ),
    );
    if (!isInGroup) {
      unauthorized();
    }
  }
  const client = await clerkClient();

  const recipeOwner = await client.users
    .getUser(recipe.createdById)
    .catch(() => null);

  // Generate schema.org structured data
  const schemaOrgRecipe = recipeToSchemaOrg(
    recipe,
    recipe.recipeIngredients.map((ri) => ({
      ingredient: ri.ingredient,
      quantity: ri.quantity,
      unit: ri.unit,
    })),
    "Recipe Creator", // You can replace this with actual user name if available
  );
  const jsonLd = generateRecipeJsonLd(schemaOrgRecipe);

  return (
    <>
      {/* Inject structured data for SEO */}
      <div dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <div className="bg-card flex min-h-[80vh] justify-center px-2 py-10">
        <Card className="bg-card w-full max-w-3xl rounded-3xl border border-black shadow-lg">
          <CardHeader className="flex flex-col items-center gap-6 pb-0">
            {recipe.stagedFile && (
              <Image
                width={256}
                height={256}
                src={recipe.stagedFile.url}
                alt={recipe.name}
                className="mb-4 h-56 w-full rounded-2xl border border-black object-cover shadow"
                priority
              />
            )}
            <CardTitle className="text-foreground text-center text-5xl leading-tight font-extrabold tracking-tight">
              {recipe.name}
            </CardTitle>
            <CardDescription className="text-muted-foreground bg-card w-full rounded-md border border-black px-4 py-2 text-start font-semibold">
              {recipe.description && recipe.description.length > 0
                ? recipe.description
                : "No description provided."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-10 pt-2">
            <CookingMode />

            {/* Recipe Stats Grid */}
            <div className="text-muted-foreground grid grid-cols-1 justify-items-center gap-4 text-lg sm:grid-cols-2 lg:grid-cols-3">
              {recipe.preparationTime && (
                <span className="w-full rounded-md border border-black px-6 py-2 text-center font-bold break-words shadow">
                  🥄 Prep: {recipe.preparationTime} min
                </span>
              )}
              {recipe.cookingTime && (
                <span className="w-full rounded-md border border-black px-6 py-2 text-center font-bold break-words shadow">
                  🍳 Cook: {recipe.cookingTime} min
                </span>
              )}
              {recipe.totalTime && (
                <span className="w-full rounded-md border border-black px-6 py-2 text-center font-bold break-words shadow">
                  ⏱️ Total: {recipe.totalTime} min
                </span>
              )}
              {recipe.servings && (
                <span className="w-full rounded-md border border-black px-6 py-2 text-center font-bold break-words shadow">
                  🍽️ Serves: {recipe.servings}
                </span>
              )}
              {recipe.difficulty && (
                <span className="w-full rounded-md border border-black px-6 py-2 text-center font-bold break-words shadow">
                  📊 {recipe.difficulty}
                </span>
              )}
              {recipe.skillLevel && (
                <span className="w-full rounded-md border border-black px-6 py-2 text-center font-bold break-words shadow">
                  🎯 {recipe.skillLevel}
                </span>
              )}
              {recipe.estimatedCost && (
                <span className="w-full rounded-md border border-black px-6 py-2 text-center font-bold break-words shadow">
                  💰 ${recipe.estimatedCost}
                </span>
              )}
              {recipe.aggregateRating && recipe.ratingCount && (
                <span className="w-full rounded-md border border-black px-6 py-2 text-center font-bold break-words shadow">
                  ⭐ {recipe.aggregateRating}/5 ({recipe.ratingCount} reviews)
                </span>
              )}
            </div>

            {/* Category and Cuisine */}
            {(recipe.recipeCategory || recipe.recipeCuisine) && (
              <div className="text-muted-foreground grid grid-cols-1 justify-items-center gap-4 text-lg sm:grid-cols-2">
                {recipe.recipeCategory && (
                  <span className="w-full rounded-md border border-black px-6 py-2 text-center font-bold break-words shadow">
                    �️ Category: {recipe.recipeCategory}
                  </span>
                )}
                {recipe.recipeCuisine && (
                  <span className="w-full rounded-md border border-black px-6 py-2 text-center font-bold break-words shadow">
                    🌍 Cuisine: {recipe.recipeCuisine}
                  </span>
                )}
              </div>
            )}

            {/* Keywords and Diet Tags */}
            {((recipe.keywords?.length ?? 0) > 0 ||
              (recipe.suitableForDiet?.length ?? 0) > 0) && (
              <div className="space-y-4">
                {recipe.keywords && recipe.keywords.length > 0 && (
                  <div>
                    <h3 className="text-foreground mb-2 text-xl font-bold">
                      Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {recipe.keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {recipe.suitableForDiet &&
                  recipe.suitableForDiet.length > 0 && (
                    <div>
                      <h3 className="text-foreground mb-2 text-xl font-bold">
                        Dietary
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {recipe.suitableForDiet.map((diet, idx) => (
                          <span
                            key={idx}
                            className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800"
                          >
                            {diet}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* Nutrition Information */}
            {(recipe.calories ??
              recipe.fat ??
              recipe.protein ??
              recipe.carbohydrates ??
              recipe.fiber ??
              recipe.sugar ??
              recipe.sodium) && (
              <div>
                <h2 className="text-foreground mb-4 text-3xl font-extrabold tracking-tight">
                  Nutrition Information
                </h2>
                <div className="text-muted-foreground grid grid-cols-2 gap-4 text-lg sm:grid-cols-3 lg:grid-cols-4">
                  {recipe.calories && (
                    <span className="w-full rounded-md border border-black px-4 py-2 text-center font-bold break-words shadow">
                      🔥 {recipe.calories} cal
                    </span>
                  )}
                  {recipe.fat && (
                    <span className="w-full rounded-md border border-black px-4 py-2 text-center font-bold break-words shadow">
                      🧈 {recipe.fat}g fat
                    </span>
                  )}
                  {recipe.protein && (
                    <span className="w-full rounded-md border border-black px-4 py-2 text-center font-bold break-words shadow">
                      🥩 {recipe.protein}g protein
                    </span>
                  )}
                  {recipe.carbohydrates && (
                    <span className="w-full rounded-md border border-black px-4 py-2 text-center font-bold break-words shadow">
                      🍞 {recipe.carbohydrates}g carbs
                    </span>
                  )}
                  {recipe.fiber && (
                    <span className="w-full rounded-md border border-black px-4 py-2 text-center font-bold break-words shadow">
                      🌾 {recipe.fiber}g fiber
                    </span>
                  )}
                  {recipe.sugar && (
                    <span className="w-full rounded-md border border-black px-4 py-2 text-center font-bold break-words shadow">
                      🍯 {recipe.sugar}g sugar
                    </span>
                  )}
                  {recipe.sodium && (
                    <span className="w-full rounded-md border border-black px-4 py-2 text-center font-bold break-words shadow">
                      🧂 {recipe.sodium}g sodium
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Equipment */}
            {recipe.recipeEquipment && recipe.recipeEquipment.length > 0 && (
              <div>
                <h2 className="text-foreground mb-4 text-3xl font-extrabold tracking-tight">
                  Required Equipment
                </h2>
                <div className="flex flex-wrap gap-2">
                  {recipe.recipeEquipment.map((equipment, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg border border-black bg-gray-100 px-3 py-2 text-sm font-medium text-gray-800"
                    >
                      🔧 {equipment}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div>
              <h2 className="text-foreground mb-4 text-3xl font-extrabold tracking-tight">
                Ingredients
              </h2>
              {Array.isArray(recipe.recipeIngredients) &&
              recipe.recipeIngredients.length > 0 ? (
                <ul className="list-none space-y-6 text-lg">
                  {recipe.recipeIngredients.map((ingredient, idx: number) => (
                    <li
                      key={idx}
                      className="bg-muted text-foreground relative rounded-md border border-black px-6 py-4 pl-6 font-semibold shadow"
                    >
                      {ingredient.ingredient.emoji} {ingredient.quantity}{" "}
                      {ingredient.unit != "none" ? `${ingredient.unit} ` : ""}
                      {ingredient.ingredient.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground rounded-md border border-black px-4 py-2 text-lg italic shadow">
                  No ingredients provided.
                </p>
              )}
            </div>
            <div>
              <h2 className="text-foreground mb-4 text-3xl font-extrabold tracking-tight">
                Instructions
              </h2>
              {Array.isArray(recipe.instructions) &&
              recipe.instructions.length > 0 ? (
                <ol className="list-inside list-decimal space-y-6 text-lg">
                  {recipe.instructions.map((step: string, idx: number) => (
                    <li
                      key={idx}
                      className="bg-muted text-foreground rounded-md border border-black px-6 py-4 font-semibold shadow"
                    >
                      {step}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-muted-foreground rounded-md border border-black px-4 py-2 text-lg italic shadow">
                  No instructions provided.
                </p>
              )}
            </div>
            <div className="mt-10 flex flex-col items-start gap-8 border-t border-black pt-8 sm:flex-row sm:items-center">
              <Avatar className="h-16 w-16 border-2 border-black">
                <AvatarImage
                  src={recipeOwner?.imageUrl ?? undefined}
                  alt={recipeOwner?.fullName ?? "User"}
                />
                <AvatarFallback className="text-foreground bg-muted text-3xl">
                  {recipeOwner?.fullName?.[0] ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <div className="text-foreground text-xl font-extrabold">
                  {recipeOwner?.fullName ?? "Unknown User"}
                </div>
                <div className="text-muted-foreground text-xs">
                  Created at: {recipe.createdAt.toLocaleString()}
                </div>
                {recipe.updatedAt && (
                  <div className="text-muted-foreground text-xs">
                    Updated at: {recipe.updatedAt.toLocaleString()}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 sm:ml-auto">
                {isOwner && (
                  <>
                    <Link href={`/app/recipes/${id}/edit`}>
                      <Button variant="outline" size="default" className="">
                        Edit
                      </Button>
                    </Link>
                    <ShareItems recipeId={id} />
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
