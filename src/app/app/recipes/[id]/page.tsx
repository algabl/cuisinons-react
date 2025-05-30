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
import { Share2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "~/components/ui/dropdown-menu";
import { ShareItems } from "~/app/_components/recipes/share-items";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const session = await auth();
  const recipe = await api.recipe.getById({ id });
  const user = await api.user.getById(session?.user?.id ?? "");

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
    <div className="flex justify-center px-2 py-10">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="flex flex-col items-center gap-2">
          {recipe.image && (
            <Image
              src={recipe.image}
              alt={recipe.name}
              className="mb-2 h-32 w-32 rounded-lg border object-cover"
            />
          )}
          <CardTitle className="text-center text-3xl font-bold">
            {recipe.name}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-center">
            {recipe.description ?? "No description provided."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-muted-foreground flex flex-wrap justify-center gap-4 text-sm">
            {recipe.cookingTime && (
              <span className="bg-muted rounded px-3 py-1">
                Cooking: {recipe.cookingTime} min
              </span>
            )}
            {recipe.preparationTime && (
              <span className="bg-muted rounded px-3 py-1">
                Prep: {recipe.preparationTime} min
              </span>
            )}
            {recipe.servings && (
              <span className="bg-muted rounded px-3 py-1">
                Servings: {recipe.servings}
              </span>
            )}
            {recipe.calories && (
              <span className="bg-muted rounded px-3 py-1">
                Calories: {recipe.calories}
              </span>
            )}
          </div>
          <div>
            <h2 className="mb-2 text-lg font-semibold">Instructions</h2>
            {Array.isArray(recipe.instructions) &&
            recipe.instructions.length > 0 ? (
              <ol className="list-inside list-decimal space-y-2">
                {recipe.instructions.map((step: string, idx: number) => (
                  <li key={idx} className="bg-muted rounded px-3 py-2">
                    {step}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-muted-foreground italic">
                No instructions provided.
              </p>
            )}
          </div>
          <div className="mt-6 flex items-center gap-3">
            <Avatar>
              <AvatarImage
                src={session.user.image ?? undefined}
                alt={session.user.name ?? "User"}
              />
              <AvatarFallback>{session.user.name?.[0] ?? "U"}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">
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
            <div className="ml-auto flex items-center gap-2">
              <Link href={`/app/recipes/${id}/edit`}>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </Link>

              <ShareItems recipeId={id} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
