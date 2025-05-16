import { Suspense } from "react";
import { CreateForm } from "~/app/_components/recipes/create-form";
import { Spinner } from "~/components/ui/spinner";

export const metadata = {
  title: "Create Recipe",
  description: "Create a new recipe",
};

export default async function Page() {
  return (
    <Suspense fallback={<Spinner />}>
      <CreateForm />
    </Suspense>
  );
}
