import { CreateForm } from "~/app/_components/recipes/create-form";

export const metadata = {
  title: "Create Recipe",
  description: "Create a new recipe",
};

export default async function Page() {
  return <CreateForm />;
}
