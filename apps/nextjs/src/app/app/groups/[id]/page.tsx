import Image from "next/image";
import { notFound, unauthorized } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { Users } from "lucide-react";

import { RoleSelect } from "~/app/_components/groups/role-select";
import { RecipeCard } from "~/app/_components/recipes/card";
import { UserSearch } from "~/app/_components/users/user-search";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { api } from "~/trpc/server";

export default async function GroupPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const session = await auth();
  const group = await api.group.getById(id);

  if (!group) {
    notFound();
  }
  const userAsMember = group.groupMembers.find(
    (member) => member.userId === session.userId,
  );

  if (!session.userId || userAsMember === undefined) {
    unauthorized();
  }

  const client = await clerkClient();

  const { data } = await client.users.getUserList({
    userId: group.groupMembers.map((member) => member.userId),
  });
  const groupMembers = group.groupMembers.map((member) => {
    const user = data.find((user) => user.id === member.userId);
    return {
      userId: member.userId,
      role: member.role,
      fullName: user?.fullName ?? "Unknown User",
      imageUrl: user?.imageUrl ?? "/avatar-placeholder.png",
      hasImage: user?.hasImage ?? false,
    };
  });
  return (
    <div className="flex justify-center px-2 py-8">
      <Card className="w-full max-w-2xl rounded-lg shadow-xl">
        <CardHeader className="flex flex-col items-center gap-2">
          <CardTitle className="text-center text-2xl font-bold text-gray-800 sm:text-3xl">
            {group.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="mb-4 flex sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-gray-700">Members</h2>
            {(userAsMember.role === "admin" ||
              userAsMember.role === "owner") && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="mt-2 sm:mt-0">
                    <Users />
                    Manage Members
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>Manage Members</DialogTitle>
                  <UserSearch groupId={group.id} />
                </DialogContent>
              </Dialog>
            )}
          </div>
          {groupMembers.length > 0 ? (
            <ul className="grid gap-4 sm:grid-cols-2">
              {groupMembers.map((member) => (
                <li
                  key={member.userId}
                  className="flex items-center gap-3 rounded-md bg-gray-100 p-3"
                >
                  <Image
                    src={
                      member.hasImage
                        ? member.imageUrl
                        : "/avatar-placeholder.png"
                    }
                    alt={member.fullName}
                    className="h-10 w-10 rounded-full border border-gray-300 object-cover"
                    width={40}
                    height={40}
                  />
                  <div>
                    <div className="font-medium text-gray-900">
                      {member.fullName}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 capitalize">
                      {(userAsMember.role === "admin" &&
                        member.role !== "owner") ||
                      (userAsMember.role === "owner" &&
                        member.userId !== userAsMember.userId) ? (
                        <RoleSelect group={group} member={member} />
                      ) : (
                        <span className="border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
                          {member.role}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-4 text-center text-gray-500">
              No members in this group.
            </p>
          )}

          <div>
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-gray-700">Recipes</h2>
            </div>
            {group.recipeSharings.length > 0 ? (
              <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.recipeSharings.map((recipeSharing) => (
                  <RecipeCard
                    key={recipeSharing.recipe.id}
                    recipe={recipeSharing.recipe}
                  />
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-gray-500">
                No recipes in this group.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
