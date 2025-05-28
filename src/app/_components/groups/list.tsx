import Link from "next/link";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import { Button } from "~/components/ui/button";

export async function List() {
  const session = await auth();
  const groups = session?.user.id
    ? await api.group.getByUserId(session.user.id)
    : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="grid gap-6 sm:grid-cols-2">
        {groups.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground py-12">
            No groups found.
          </div>
        ) : (
          groups.map((group) => (
            <div
              key={group.id}
              className="flex flex-col gap-4 rounded-xl border bg-card p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold truncate">{group.name}</h2>
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
