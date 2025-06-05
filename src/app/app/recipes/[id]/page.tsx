import { notFound, unauthorized } from "next/navigation";
import { api } from "~/trpc/server";
import { auth } from "~/server/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ShareItems } from "~/app/_components/recipes/share-items";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const session = await auth();
  const recipe = await api.recipe.getById({ id });

  if (!session?.user?.id) {
    unauthorized();
  }

  const user = await api.user.getById(session.user.id);
  if (!recipe) {
    notFound();
  }

  const isOwner = session?.user?.id === recipe.createdById;
  const isInGroup = recipe.recipeSharings.some((sharing) =>
    user?.groupMembers.some(
      (groupMember) => sharing.groupId === groupMember.groupId,
    ),
  );

  if (!session?.user?.id || (!isOwner && recipe.isPrivate && !isInGroup)) {
    unauthorized();
  }

  return (
    <div className="bg-card flex min-h-[80vh] justify-center px-2 py-10">
      <Card
        hover={false}
        className="bg-card w-full max-w-3xl rounded-3xl border border-black shadow-lg"
      >
        <CardHeader className="flex flex-col items-center gap-6 pb-0">
          {recipe.image && (
            <Image
              width={256}
              height={256}
              src={recipe.image}
              alt={recipe.name}
              className="mb-4 h-56 w-full rounded-2xl border border-black object-cover shadow"
              priority
            />
          )}
          <CardTitle className="text-foreground text-center text-5xl leading-tight font-extrabold tracking-tight">
            {recipe.name}
          </CardTitle>
          <CardDescription className="text-muted-foreground bg-card w-full rounded-md border border-black px-4 py-2 text-start font-semibold">
            {recipe.description ?? "No description provided."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-10 pt-2">
          <div className="text-muted-foreground grid grid-cols-1 justify-items-center gap-4 text-lg sm:grid-cols-1 md:grid-cols-2">
            {recipe.cookingTime && (
              <span className="w-full rounded-md border border-black px-6 py-2 text-center font-bold break-words shadow">
                🍳 Cooking: {recipe.cookingTime} min
              </span>
            )}
            {recipe.preparationTime && (
              <span className="w-full rounded-md border border-black px-6 py-2 text-center font-bold break-words shadow">
                🥄 Prep: {recipe.preparationTime} min
              </span>
            )}
            {recipe.servings && (
              <span className="w-full rounded-md border border-black px-6 py-2 text-center font-bold break-words shadow">
                🍽️ Servings: {recipe.servings}
              </span>
            )}
            {recipe.calories && (
              <span className="w-full rounded-md border border-black px-6 py-2 text-center font-bold break-words shadow">
                🔥 Calories: {recipe.calories}
              </span>
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
                src={session.user.image ?? undefined}
                alt={session.user.name ?? "User"}
              />
              <AvatarFallback className="text-foreground bg-muted text-3xl">
                {session.user.name?.[0] ?? "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <div className="text-foreground text-xl font-extrabold">
                {session.user.name ?? "Unknown User"}
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
  );
}
