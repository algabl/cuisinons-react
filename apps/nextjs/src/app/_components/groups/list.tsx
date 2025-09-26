import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { api } from "~/trpc/server";
import { Button } from "~/components/ui/button";

export async function List() {
  const session = await auth();
  const groups = session.userId
    ? await api.group.getByUserId(session.userId)
    : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="grid gap-6 sm:grid-cols-2">
        {groups.length === 0 ? (
          <div className="text-muted-foreground col-span-full py-12 text-center">
            No groups found.
          </div>
        ) : (
          groups.map((group) => (
            <div
              key={group.id}
              className="bg-card flex flex-col gap-4 rounded-xl p-6 shadow-sm"
            >
              <h2 className="truncate text-xl font-semibold">{group.name}</h2>
              <Button asChild>
                <Link href={`/app/groups/${group.id}`}>View Group</Link>
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
