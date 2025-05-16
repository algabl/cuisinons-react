"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { redirect } from "next/navigation";

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
});

export function CreateForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      image: "",
      cookingTime: undefined,
      preparationTime: undefined,
      servings: undefined,
      calories: undefined,
      instructions: [""],
    },
  });

  const recipeCreate = api.recipe.create.useMutation();

  function onSubmit(values: z.infer<typeof formSchema>) {
    recipeCreate.mutate({
      name: values.name,
      description: values.description,
      image: values.image,
      cookingTime: values.cookingTime,
      preparationTime: values.preparationTime,
      servings: values.servings,
      calories: values.calories,
      instructions: values.instructions,
    });
    redirect("/app/recipes");
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
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
