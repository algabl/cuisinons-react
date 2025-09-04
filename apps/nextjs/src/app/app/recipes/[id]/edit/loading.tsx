import { FormSkeleton } from "~/components/skeleton/form";

export default function Loading() {
  return <FormSkeleton fields={3} actions={2} />;
}
