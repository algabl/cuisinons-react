import { CreateForm } from "~/app/_components/recipes/create-form";

export const metadata = {
  title: "Create Recipe",
  description: "Create a new recipe",
};

export default function Page() {

  return (
    <div className="bg-card border-border mx-auto mt-4 w-full max-w-lg space-y-8 rounded-2xl border p-8 shadow">
      <h1 className="text-center text-3xl font-bold">Create Recipe</h1>
      <CreateForm />
    </div>
  );
}
