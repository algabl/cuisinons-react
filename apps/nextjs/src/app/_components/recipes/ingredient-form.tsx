import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Ingredient, Recipe } from "@cuisinons/api/types";
import { api } from "~/trpc/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

const formSchema = z.object({
  quantity: z.coerce.number().positive("Quantity must be positive"),
  unit: z.string().optional(),
});

export function IngredientForm({
  ingredient,
  recipe,
}: {
  ingredient: Ingredient;
  recipe: Recipe;
}) {
  const addIngredientForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 1,
      unit: "",
    },
  });

  const addIngredientMutation = api.recipe.addIngredient.useMutation();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await addIngredientMutation.mutateAsync({
      recipeId: recipe.id,
      ingredientId: ingredient.id,
      quantity: values.quantity,
      unit: values.unit,
    });
  }
  return (
    <Form {...addIngredientForm}>
      <form
        onSubmit={addIngredientForm.handleSubmit(onSubmit)}
        className="flex items-end space-x-2"
      >
        <FormField
          control={addIngredientForm.control}
          name="quantity"
          render={({ field }) => (
            <FormItem className="w-20">
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={addIngredientForm.control}
          name="unit"
          render={({ field }) => (
            <FormItem className="flex-grow">
              <FormLabel>Notes (e.g., chopped, sliced)</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={"none"}>None</SelectItem>
                    <SelectItem value="g">grams</SelectItem>
                    <SelectItem value="kg">kilograms</SelectItem>
                    <SelectItem value="ml">milliliters</SelectItem>
                    <SelectItem value="l">liters</SelectItem>
                    <SelectItem value="tsp">teaspoon</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit">Add</Button>
      </form>
    </Form>
  );
}
