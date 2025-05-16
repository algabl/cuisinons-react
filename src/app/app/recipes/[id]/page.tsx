import { notFound } from "next/navigation";
import { api } from "~/trpc/server"; // Use the server-side trpc API

export default async function Page(props: { params: { id: string } }) {
  const { id } = props.params;
  const recipe = await api.recipe.getById({ id });

  if (!recipe) {
    notFound();
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
