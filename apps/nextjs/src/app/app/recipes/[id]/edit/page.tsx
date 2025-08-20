import type { Metadata } from "next";
import { notFound, unauthorized } from "next/navigation";
import EditForm from "~/app/_components/recipes/edit-form";
import { auth } from "@cuisinons/auth";
import { api } from "~/trpc/server";

export const metadata: Metadata = {
  title: "Edit Recipe",
};

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const session = await auth();

  if (!session?.userId) {
    unauthorized();
  }
  const recipe = await api.recipe.getById({ id });
  const isOwner = session?.userId === recipe?.createdById;

  if (!recipe) {
    return notFound();
  }

  if (!isOwner) {
    unauthorized();
  }

  return (
    <div className="bg-card border-border mx-auto mt-4 w-full max-w-lg space-y-8 rounded-2xl border p-8 shadow">
      <h1 className="text-center text-3xl font-bold">Edit Recipe</h1>
      <EditForm recipe={recipe} />
    </div>
  );
}
