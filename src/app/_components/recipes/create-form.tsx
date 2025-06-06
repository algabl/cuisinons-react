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
import RecipeForm, { formSchema } from "./form";
import { api } from "~/trpc/react";
import { redirect } from "next/navigation";

export function CreateForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const recipeCreate = api.recipe.create.useMutation();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const created = await recipeCreate.mutateAsync({
      name: values.name,
      description: values.description,
      image: values.image,
      cookingTime: values.cookingTime,
      preparationTime: values.preparationTime,
      servings: values.servings,
      calories: values.calories,
      instructions: values.instructions,
      isPrivate: values.isPrivate ?? true,
      recipeIngredients: values.recipeIngredients?.map((ingredient) => ({
        ingredientId: ingredient.ingredientId,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
      })),
    });
    redirect(`/app/recipes/${created.data}`);
  }

  return (
    // <Form {...form}>
    //   <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
    //     <FormField
    //       control={form.control}
    //       name="name"
    //       render={({ field }) => (
    //         <FormItem>
    //           <FormLabel>Name</FormLabel>
    //           <FormControl>
    //             <Input placeholder="shadcn" {...field} />
    //           </FormControl>
    //           <FormDescription>This is the recipe&apos;s name.</FormDescription>
    //           <FormMessage />
    //         </FormItem>
    //       )}
    //     />
    //     <FormField
    //       control={form.control}
    //       name="description"
    //       render={({ field }) => (
    //         <FormItem>
    //           <FormLabel>Description</FormLabel>
    //           <FormControl>
    //             <Input placeholder="A recipe for shadcn" {...field} />
    //           </FormControl>
    //           <FormDescription>
    //             This is the recipe&apos;s description.
    //           </FormDescription>
    //           <FormMessage />
    //         </FormItem>
    //       )}
    //     />
    //     <Button type="submit">Submit</Button>
    //   </form>
    // </Form>
    <RecipeForm onSubmit={onSubmit} />
  );
}
