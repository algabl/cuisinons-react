"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import type { inferRouterOutputs } from "@trpc/server";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { AppRouter } from "~/server/api/root";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { redirect } from "next/navigation";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { SpinnerButton } from "~/components/spinner-button";

type Recipe = NonNullable<inferRouterOutputs<AppRouter>["recipe"]["getById"]>;

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().optional(),
  image: z
    .string()
    .optional()
    .refine((val) => !val || z.string().url().safeParse(val).success, {
      message: "Must be a valid URL",
    }),
  cookingTime: z.coerce.number().int().positive().optional(),
  preparationTime: z.coerce.number().int().positive().optional(),
  servings: z.coerce.number().int().positive().optional(),
  calories: z.coerce.number().int().positive().optional(),
  instructions: z.string().array().optional(),
  isPrivate: z.boolean().optional(),
});

export default function EditForm({ recipe }: { recipe: Recipe }) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: recipe.name,
      description: recipe.description ?? "",
      image: recipe.image ?? "",
      cookingTime: recipe.cookingTime ?? undefined,
      preparationTime: recipe.preparationTime ?? undefined,
      servings: recipe.servings ?? undefined,
      calories: recipe.calories ?? undefined,
      instructions: recipe.instructions ?? [],
      isPrivate: recipe.isPrivate ?? true,
    },
  });

  const recipeUpdate = api.recipe.update.useMutation();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await recipeUpdate.mutateAsync({
      id: recipe.id,
      name: values.name,
      description: values.description,
      image: values.image,
      cookingTime: values.cookingTime,
      preparationTime: values.preparationTime,
      servings: values.servings,
      calories: values.calories,
      instructions: values.instructions,
      isPrivate: values.isPrivate ?? true,
    });
    redirect(`/app/recipes/${recipe.id}`);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Recipe name" {...field} />
              </FormControl>
              <FormDescription>This is the recipe&apos;s name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="A recipe for..." {...field} />
              </FormControl>
              <FormDescription>
                This is the recipe&apos;s description.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Image URL */}
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.jpg" {...field} />
              </FormControl>
              <FormDescription>
                Optional: Add a link to an image for this recipe.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Cooking Time */}
        <FormField
          control={form.control}
          name="cookingTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cooking Time (minutes)</FormLabel>
              <FormControl>
                <Input type="number" min={1} placeholder="e.g. 30" {...field} />
              </FormControl>
              <FormDescription>How long does it take to cook?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Preparation Time */}
        <FormField
          control={form.control}
          name="preparationTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preparation Time (minutes)</FormLabel>
              <FormControl>
                <Input type="number" min={1} placeholder="e.g. 15" {...field} />
              </FormControl>
              <FormDescription>
                How long does it take to prepare?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Servings */}
        <FormField
          control={form.control}
          name="servings"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Servings</FormLabel>
              <FormControl>
                <Input type="number" min={1} placeholder="e.g. 4" {...field} />
              </FormControl>
              <FormDescription>
                How many servings does this recipe make?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Calories */}
        <FormField
          control={form.control}
          name="calories"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Calories</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  placeholder="e.g. 250"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Calories per serving (optional).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Instructions (as textarea, one per line) */}
        <FormField
          control={form.control}
          name="instructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instructions</FormLabel>
              <FormControl>
                <textarea
                  className="border-input bg-background min-h-[100px] w-full rounded-md border px-3 py-2 text-sm shadow-sm"
                  placeholder="Step 1\nStep 2\nStep 3"
                  value={field.value?.join("\n") ?? ""}
                  onChange={(e) => field.onChange(e.target.value.split("\n"))}
                />
              </FormControl>
              <FormDescription>Enter each step on a new line.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Is Private */}
        <FormField
          control={form.control}
          name="isPrivate"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Switch
                  id="isPrivate"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>Private Recipe</FormLabel>
              <FormDescription>
                Check this if you want to keep this recipe private. Sharing this
                recipe to a group will still make it visible to that group.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <SpinnerButton type="submit" loading={recipeUpdate.isPending}>
          Submit Recipe
        </SpinnerButton>
      </form>
    </Form>
  );
}
