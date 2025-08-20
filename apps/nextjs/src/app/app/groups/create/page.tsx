import { Suspense } from "react";
import { CreateForm } from "~/app/_components/groups/create-form";
import { Spinner } from "~/components/ui/spinner";

export const metadata = {
  title: "Create Group",
  description: "Create a new group",
};

export default async function Page() {
  return (
    <Suspense fallback={<Spinner />}>
      <CreateForm />
    </Suspense>
  );
}
