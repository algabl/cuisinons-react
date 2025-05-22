import Link from "next/link";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";

export async function List() {
  const session = await auth();
  const groups = session?.user.id
    ? await api.group.getByUserId(session.user.id)
    : [];
  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <div
          key={group.id}
          className="flex items-center justify-between rounded-lg bg-gray-100 p-4 shadow"
        >
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">{group.name}</h2>
          </div>
          <Link
            href={`/app/groups/${group.id}`}
            className="rounded-lg bg-blue-500 px-4 py-2 text-white"
          >
            View Group
          </Link>
        </div>
      ))}
    </div>
  );
}
