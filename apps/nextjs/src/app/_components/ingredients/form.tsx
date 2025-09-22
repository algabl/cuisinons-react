"use client";

import type { ReactNode } from "react";
import type { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import type { IngredientFormData } from "@cuisinons/api/types";

import { Button } from "~/components/ui/button";
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
import { ingredientFormSchema } from "~/lib/validations";

export type IngredientPrefill = Partial<z.infer<typeof ingredientFormSchema>>;

export default function IngredientForm({
  onSubmit,
  prefill,
  isLoading = false,
  submitWrapper,
}: {
  onSubmit: (ingredient: IngredientFormData) => void;
  prefill?: IngredientPrefill;
  isLoading?: boolean;
  submitWrapper?: (button: ReactNode) => ReactNode;
}) {
  const form = useForm({
    resolver: zodResolver(ingredientFormSchema),
    defaultValues: {
      name: prefill?.name ?? "",
      description: prefill?.description ?? "",
    },
  });

  const submitButton = (
    <Button
      type="button"
      onClick={form.handleSubmit(onSubmit)}
      disabled={isLoading}
    >
      {isLoading ? "Saving..." : "Submit"}
    </Button>
  );

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
        {submitWrapper ? submitWrapper(submitButton) : submitButton}
      </div>
    </Form>
  );
}
