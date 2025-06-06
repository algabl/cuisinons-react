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
import { Switch } from "~/components/ui/switch";
import { SpinnerButton } from "~/components/spinner-button";
import { IngredientSelect } from "./ingredient-select";
import { type Ingredient, type Recipe } from "~/server/api/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Trash2 } from "lucide-react";

export const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().optional(),
  image: z.string().optional(),
  cookingTime: z.union([z.number(), z.string()]).optional(),
  preparationTime: z.union([z.number(), z.string()]).optional(),
  servings: z.union([z.number(), z.string()]).optional(),
  calories: z.union([z.number(), z.string()]).optional(),
  instructions: z.array(z.string()).default([]),
  isPrivate: z.boolean().default(true),
  recipeIngredients: z
    .array(
      z.object({
        ingredientId: z.string(),
        quantity: z.number().positive("Quantity must be positive"),
        unit: z.string(),
        name: z.string().optional(),
      }),
    )
    .default([]),
});

export default function RecipeForm({
  recipe,
  onSubmit,
}: {
  recipe?: Recipe;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
}) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: recipe?.name ?? "",
      description: recipe?.description ?? "",
      image: recipe?.image ?? "",
      cookingTime: recipe?.cookingTime ?? "",
      preparationTime: recipe?.preparationTime ?? "",
      servings: recipe?.servings ?? "",
      calories: recipe?.calories ?? "",
      instructions: recipe?.instructions ?? [],
      isPrivate: recipe?.isPrivate ?? true,
      recipeIngredients:
        recipe?.recipeIngredients.map((recipe) => {
          return {
            ingredientId: recipe?.ingredientId,
            quantity: recipe?.quantity ?? 0,
            unit: recipe?.unit ?? "none",
            name: recipe?.ingredient.name ?? "",
          };
        }) ?? [],
    },
  });

  const recipeUpdate = api.recipe?.update.useMutation();

  // Helper to add ingredient to form state
  function handleAddIngredient(ingredient: Ingredient) {
    console.log("Adding ingredient:", ingredient);
    const current = form.getValues("recipeIngredients") ?? [];
    console.log("Current ingredients:", current);
    if (!current.some((i) => i.ingredientId === ingredient.id)) {
      form.setValue("recipeIngredients", [
        ...current,
        {
          ingredientId: ingredient.id,
          quantity: 0,
          unit: "none",
          name: ingredient.name ?? "",
        },
      ]);
    }
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
                Optional: Add a link to an image for this recipe?.
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
        {/* Ingredients */}

        {(form.watch("recipeIngredients") ?? []).length > 0 && (
          <>
            <h2 className="text-foreground mb-4 text-3xl font-extrabold tracking-tight">
              Ingredients
            </h2>
            <div className="text-muted-foreground mb-2 grid grid-cols-12 items-end gap-2 font-semibold">
              <div className="col-span-6">Name</div>
              <div className="col-span-3">Quantity</div>
              <div className="col-span-3">Unit</div>
            </div>
            <div className="space-y-2">
              {(form.watch("recipeIngredients") ?? []).map(
                (ingredient, idx) => (
                  <div
                    key={ingredient.ingredientId}
                    className="grid grid-cols-12 items-end gap-2"
                  >
                    <span className="col-span-5 truncate font-semibold">
                      {ingredient.name}
                    </span>
                    <div className="col-span-3">
                      <FormField
                        control={form.control}
                        name={`recipeIngredients.${idx}.quantity`}
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel className="sr-only">Qty</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                min={0}
                                {...field}
                                value={field.value ?? 0}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? 0
                                      : Number(e.target.value),
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-3">
                      <FormField
                        control={form.control}
                        name={`recipeIngredients.${idx}.unit`}
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel className="sr-only">Unit</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value ?? ""}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select unit" />
                                </SelectTrigger>
                                <SelectContent className="w-full">
                                  <SelectItem value={"none"}>None</SelectItem>
                                  <SelectItem value="g">grams</SelectItem>
                                  <SelectItem value="kg">kilograms</SelectItem>
                                  <SelectItem value="ml">
                                    milliliters
                                  </SelectItem>
                                  <SelectItem value="l">liters</SelectItem>
                                  <SelectItem value="tsp">teaspoon</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-1">
                      <button
                        type="button"
                        className="h-full w-full text-red-500 hover:text-red-700"
                        onClick={() => {
                          const currentIngredients =
                            form.getValues("recipeIngredients") ?? [];
                          form.setValue(
                            "recipeIngredients",
                            currentIngredients.filter(
                              (ing) =>
                                ing.ingredientId !== ingredient.ingredientId,
                            ),
                          );
                        }}
                      >
                        <Trash2 />
                      </button>
                    </div>
                  </div>
                ),
              )}
            </div>
          </>
        )}
        <IngredientSelect
          onSelect={handleAddIngredient}
          recipeIngredients={form.watch("recipeIngredients")}
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
