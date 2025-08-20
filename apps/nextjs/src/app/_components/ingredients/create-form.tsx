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
import { ingredientFormSchema } from "~/lib/validations";

type Ingredient = NonNullable<
  inferRouterOutputs<AppRouter>["ingredient"]["getById"]
>;
export default function CreateForm({
  onSubmit,
  prefill,
}: {
  onSubmit?: (ingredient: Ingredient) => void;
  prefill?: Partial<z.infer<typeof ingredientFormSchema>>;
}) {
  const form = useForm({
    resolver: zodResolver(ingredientFormSchema),
    defaultValues: {
      name: prefill?.name ?? "",
      description: prefill?.description ?? "",
    },
  });

  const ingredientCreate = api.ingredient.create.useMutation();

  async function handleSubmit(values: z.infer<typeof ingredientFormSchema>) {
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
      <div className="space-y-4">
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Ingredient name" {...field} />
              </FormControl>
              <FormDescription>
                This is the ingredient&apos;s name.
              </FormDescription>
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
                <Input placeholder="An ingredient for..." {...field} />
              </FormControl>
              <FormDescription>
                This is the ingredient&apos;s description.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="button" onClick={form.handleSubmit(handleSubmit)}>
          Submit
        </Button>
      </div>
    </Form>
  );
}
