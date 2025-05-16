import { notFound, unauthorized } from "next/navigation";
import { api } from "~/trpc/server"; // Use the server-side trpc API
import { auth } from "~/server/auth";

export default async function Page(props: { params: { id: string } }) {
  const { id } = props.params;
  const session = await auth();
  const recipe = await api.recipe.getById({ id });

  if (!recipe) {
    notFound();
  }

  if (!session?.user?.id || recipe.createdById !== session.user.id) {
    unauthorized();
  }

  return (
    <div>
      <h1>{recipe.name}</h1>
      <p>{recipe.description}</p>
      <p>Created by: {recipe.createdById}</p>
      <p>Created at: {recipe.createdAt.toString()}</p>
      <p>Updated at: {recipe.updatedAt?.toString()}</p>
    </div>
  );
}
