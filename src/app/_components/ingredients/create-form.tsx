"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import type { AppRouter } from "~/server/api/root";
import type { inferRouterOutputs } from "@trpc/server";

export const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().optional(),
});

type Ingredient = NonNullable<
  inferRouterOutputs<AppRouter>["ingredient"]["getById"]
>;
export default function CreateForm({
  onSubmit,
}: {
  onSubmit?: (ingredient: Ingredient) => void;
}) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const ingredientCreate = api.ingredient.create.useMutation();

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    const response = await ingredientCreate.mutateAsync({
      name: values.name,
      description: values.description,
    });
    if (onSubmit) {
      onSubmit(response.data as Ingredient);
    } else {
      // If no onSubmit callback is provided, redirect to the ingredient list
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
