"use client";

import { useState } from "react";

import { api } from "~/trpc/react";

export function LatestPost() {
  const [latestRecipe] = api.recipe.getLatest.useSuspenseQuery();

  const utils = api.useUtils();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const createRecipe = api.recipe.create.useMutation({
    onSuccess: async () => {
      await utils.recipe.invalidate();
      setName("");
    },
  });

  return (
    <div className="w-full max-w-xs">
      {latestRecipe ? (
        <p className="truncate">Your most recent recipe: {latestRecipe.name}</p>
      ) : (
        <p>You have no recipes yet.</p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createRecipe.mutate({ name, description });
        }}
        className="flex flex-col gap-2"
      >
        <input
          type="text"
          placeholder="Title"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-full bg-white/10 px-4 py-2 text-white"
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-full bg-white/10 px-4 py-2 text-white"
        />
        <button
          type="submit"
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
          disabled={createRecipe.isPending}
        >
          {createRecipe.isPending ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
