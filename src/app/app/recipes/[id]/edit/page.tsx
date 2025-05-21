import EditForm from "~/app/_components/recipes/edit-form";
import { api } from "~/trpc/server";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const recipe = await api.recipe.getById({ id });

  if (!recipe) {
    return <div>Recipe not found</div>;
  }
  return <EditForm recipe={recipe} />;
}
