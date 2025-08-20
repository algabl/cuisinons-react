import Stream from "~/app/_components/chat/stream";

export const metadata = {
  title: "Chat with Remi",
  description: "Ask Remi about your recipes, ingredients, or cooking tips.",
};

export default function Page() {
  return (
    <div className="h-full w-full overflow-hidden">
      <div className="bg-background mx-auto flex h-full max-w-md flex-col">
        <Stream />
      </div>
    </div>
  );
}
