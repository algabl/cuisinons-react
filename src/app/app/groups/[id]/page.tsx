import { DialogTitle } from "@radix-ui/react-dialog";
import Image from "next/image";
import { notFound, redirect, unauthorized } from "next/navigation";
import { UserSearch } from "~/app/_components/users/user-search";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { auth } from "~/server/auth";
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

  if (
    !session?.user?.id ||
    group.groupMembers.find((member) => member.userId === session.user.id) ===
      undefined
  ) {
    unauthorized();
  }

  return (
    <div className="flex justify-center px-2 py-10">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="flex flex-col items-center gap-2">
          <CardTitle className="text-center text-3xl font-bold">
            {group.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex">
              <h2 className="mb-2 text-lg font-semibold">Members</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="ml-2">
                    Add Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>Add Member</DialogTitle>
                  <UserSearch groupId={group.id} />
                </DialogContent>
              </Dialog>
            </div>
            {Array.isArray(group.groupMembers) &&
            group.groupMembers.length > 0 ? (
              group.groupMembers.map((member) => (
                <div key={member.userId} className="mb-2 flex items-center">
                  <Image
                    src={member.user.image ?? ""}
                    alt={member.user.name ?? ""}
                    className="mb-2 h-10 w-10 rounded-full"
                    width={40}
                    height={40}
                  />
                  {member.user.name} ({member.role})
                </div>
              ))
            ) : (
              <p>No members in this group.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
