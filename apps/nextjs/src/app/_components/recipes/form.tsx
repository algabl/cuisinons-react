"use client";
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
import { api } from "~/trpc/react";
import { Switch } from "~/components/ui/switch";
import { SpinnerButton } from "~/components/spinner-button";
import { IngredientSelect } from "./ingredient-select";
import type {Ingredient, Recipe, RecipeFormData} from "@cuisinons/api/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Trash2 } from "lucide-react";
import { recipeFormSchema } from "@cuisinons/api/types";

export { recipeFormSchema as formSchema };

export default function RecipeForm({
  recipe,
  onSubmit,
}: {
  recipe?: Recipe;
  onSubmit: (values: RecipeFormData) => void;
}) {
  const form = useForm({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      name: recipe?.name ?? "",
      description: recipe?.description ?? "",
      image: recipe?.image ?? "",

      // Time fields
      cookingTime: recipe?.cookingTime ?? undefined,
      preparationTime: recipe?.preparationTime ?? undefined,
      totalTime: recipe?.totalTime ?? undefined,

      // Yield
      servings: recipe?.servings ?? undefined,

      // Nutrition
      calories: recipe?.calories ?? undefined,
      fat: recipe?.fat ?? undefined,
      protein: recipe?.protein ?? undefined,
      carbohydrates: recipe?.carbohydrates ?? undefined,
      fiber: recipe?.fiber ?? undefined,
      sugar: recipe?.sugar ?? undefined,
      sodium: recipe?.sodium ?? undefined,

      // Categories
      recipeCategory: recipe?.recipeCategory ?? undefined,
      recipeCuisine: recipe?.recipeCuisine ?? undefined,
      keywords: recipe?.keywords ?? [],

      // Difficulty
      difficulty: recipe?.difficulty ?? undefined,
      skillLevel: recipe?.skillLevel ?? undefined,

      // Dietary
      suitableForDiet: recipe?.suitableForDiet ?? [],

      // Equipment
      recipeEquipment: recipe?.recipeEquipment ?? [],

      // Cost
      estimatedCost: recipe?.estimatedCost ?? undefined,

      // Existing fields
      instructions: recipe?.instructions ?? [],
      isPrivate: recipe?.isPrivate ?? true,
      recipeIngredients:
        recipe?.recipeIngredients.map((recipe) => {
          return {
            ingredientId: recipe.ingredientId,
            quantity: recipe.quantity ?? 0,
            unit: recipe.unit ?? "none",
            name: recipe.ingredient.name,
          };
        }) ?? [],
    },
  });


  const recipeUpdate = api.recipe.update.useMutation();

  // Helper to add ingredient to form state
  function handleAddIngredient(ingredient: Ingredient) {
    console.log("Adding ingredient:", ingredient);
    const current = (form.getValues("recipeIngredients") as {
      ingredientId: string;
      quantity: number;
      unit: string;
      name: string;
    }[]);
    console.log("Current ingredients:", current);
    if (!current.some((i) => i.ingredientId === ingredient.id)) {
      form.setValue("recipeIngredients", [
        ...current,
        {
          ingredientId: ingredient.id,
          quantity: 0,
          unit: "none",
          name: ingredient.name,
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
              {form.formState.errors.name && <FormMessage>{form.formState.errors.name.message}</FormMessage>}
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
              {form.formState.errors.description && <FormMessage>{form.formState.errors.description.message}</FormMessage>}
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
              {form.formState.errors.image && <FormMessage>{form.formState.errors.image.message}</FormMessage>}
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
              {form.formState.errors.cookingTime && <FormMessage>{form.formState.errors.cookingTime.message}</FormMessage>}
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
              {form.formState.errors.preparationTime && <FormMessage>{form.formState.errors.preparationTime.message}</FormMessage>}
            </FormItem>
          )}
        />
        {/* Total Time */}
        <FormField
          control={form.control}
          name="totalTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Time (minutes)</FormLabel>
              <FormControl>
                <Input type="number" min={1} placeholder="e.g. 45" {...field} />
              </FormControl>
              <FormDescription>
                Total time from start to finish (prep + cook time)
              </FormDescription>
              {form.formState.errors.totalTime && <FormMessage>{form.formState.errors.totalTime.message}</FormMessage>}
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
              {form.formState.errors.servings && <FormMessage>{form.formState.errors.servings.message}</FormMessage>}
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

        {/* Additional Nutrition Fields */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="fat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fat (grams)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    min={0}
                    placeholder="e.g. 12.5"
                    {...field}
                  />
                </FormControl>
                {form.formState.errors.fat && <FormMessage>{form.formState.errors.fat.message}</FormMessage>}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="protein"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Protein (grams)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    min={0}
                    placeholder="e.g. 15.2"
                    {...field}
                  />
                </FormControl>
                {form.formState.errors.protein && <FormMessage>{form.formState.errors.protein.message}</FormMessage>}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="carbohydrates"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Carbohydrates (grams)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    min={0}
                    placeholder="e.g. 30.5"
                    {...field}
                  />
                </FormControl>
                {form.formState.errors.carbohydrates && <FormMessage>{form.formState.errors.carbohydrates.message}</FormMessage>}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fiber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fiber (grams)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    min={0}
                    placeholder="e.g. 5.2"
                    {...field}
                  />
                </FormControl>
                {form.formState.errors.fiber && <FormMessage>{form.formState.errors.fiber.message}</FormMessage>}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sugar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sugar (grams)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    min={0}
                    placeholder="e.g. 8.3"
                    {...field}
                  />
                </FormControl>
                {form.formState.errors.sugar && <FormMessage>{form.formState.errors.sugar.message}</FormMessage>}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sodium"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sodium (grams)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    min={0}
                    placeholder="e.g. 1.2"
                    {...field}
                  />
                </FormControl>
                {form.formState.errors.sodium && <FormMessage>{form.formState.errors.sodium.message}</FormMessage>}
              </FormItem>
            )}
          />
        </div>

        {/* Recipe Category and Cuisine */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="recipeCategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="appetizer">Appetizer</SelectItem>
                      <SelectItem value="main-course">Main Course</SelectItem>
                      <SelectItem value="dessert">Dessert</SelectItem>
                      <SelectItem value="snack">Snack</SelectItem>
                      <SelectItem value="beverage">Beverage</SelectItem>
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                      <SelectItem value="side-dish">Side Dish</SelectItem>
                      <SelectItem value="soup">Soup</SelectItem>
                      <SelectItem value="salad">Salad</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>What type of dish is this?</FormDescription>
                {form.formState.errors.recipeCategory && <FormMessage>{form.formState.errors.recipeCategory.message}</FormMessage>}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="recipeCuisine"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cuisine</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select cuisine" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="american">American</SelectItem>
                      <SelectItem value="chinese">Chinese</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                      <SelectItem value="italian">Italian</SelectItem>
                      <SelectItem value="japanese">Japanese</SelectItem>
                      <SelectItem value="mexican">Mexican</SelectItem>
                      <SelectItem value="indian">Indian</SelectItem>
                      <SelectItem value="thai">Thai</SelectItem>
                      <SelectItem value="mediterranean">
                        Mediterranean
                      </SelectItem>
                      <SelectItem value="korean">Korean</SelectItem>
                      <SelectItem value="greek">Greek</SelectItem>
                      <SelectItem value="spanish">Spanish</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>
                  What cuisine style is this recipe?
                </FormDescription>
                {form.formState.errors.recipeCuisine && <FormMessage>{form.formState.errors.recipeCuisine.message}</FormMessage>}
              </FormItem>
            )}
          />
        </div>

        {/* Difficulty and Skill Level */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficulty</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                {form.formState.errors.difficulty && <FormMessage>{form.formState.errors.difficulty.message}</FormMessage>}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="skillLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Skill Level</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select skill level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                {form.formState.errors.skillLevel && <FormMessage>{form.formState.errors.skillLevel.message}</FormMessage>}
              </FormItem>
            )}
          />
        </div>

        {/* Cost */}
        <FormField
          control={form.control}
          name="estimatedCost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Cost ($)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  placeholder="e.g. 15.50"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Estimated cost to make this recipe (optional)
              </FormDescription>
              {form.formState.errors.estimatedCost && <FormMessage>{form.formState.errors.estimatedCost.message}</FormMessage>}
            </FormItem>
          )}
        />

        {/* Keywords */}
        <FormField
          control={form.control}
          name="keywords"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Keywords/Tags</FormLabel>
              <FormControl>
                <textarea
                  className="border-input bg-background min-h-[60px] w-full rounded-md border px-3 py-2 text-sm shadow-sm"
                  placeholder="quick, healthy, gluten-free, vegan"
                  value={field.value?.join(", ") ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value
                        .split(",")
                        .map((k) => k.trim())
                        .filter((k) => k),
                    )
                  }
                />
              </FormControl>
              <FormDescription>
                Enter keywords separated by commas
              </FormDescription>
              {form.formState.errors.keywords && <FormMessage>{form.formState.errors.keywords.message}</FormMessage>}
            </FormItem>
          )}
        />

        {/* Dietary Restrictions */}
        <FormField
          control={form.control}
          name="suitableForDiet"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Suitable For Diet</FormLabel>
              <FormControl>
                <textarea
                  className="border-input bg-background min-h-[60px] w-full rounded-md border px-3 py-2 text-sm shadow-sm"
                  placeholder="vegan, gluten-free, keto, dairy-free"
                  value={field.value?.join(", ") ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value
                        .split(",")
                        .map((d) => d.trim())
                        .filter((d) => d),
                    )
                  }
                />
              </FormControl>
              <FormDescription>
                Enter dietary restrictions separated by commas
              </FormDescription>
              {form.formState.errors.suitableForDiet && <FormMessage>{form.formState.errors.suitableForDiet.message}</FormMessage>}
            </FormItem>
          )}
        />

        {/* Equipment */}
        <FormField
          control={form.control}
          name="recipeEquipment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Required Equipment</FormLabel>
              <FormControl>
                <textarea
                  className="border-input bg-background min-h-[60px] w-full rounded-md border px-3 py-2 text-sm shadow-sm"
                  placeholder="oven, mixing bowl, whisk, baking sheet"
                  value={field.value?.join(", ") ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value
                        .split(",")
                        .map((eq) => eq.trim())
                        .filter((eq) => eq),
                    )
                  }
                />
              </FormControl>
              <FormDescription>
                Enter required equipment separated by commas
              </FormDescription>
              {form.formState.errors.recipeEquipment && <FormMessage>{form.formState.errors.recipeEquipment.message}</FormMessage>}
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
              {form.formState.errors.instructions && <FormMessage>{form.formState.errors.instructions.message}</FormMessage>}
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
              {form.formState.errors.isPrivate && <FormMessage>{form.formState.errors.isPrivate.message}</FormMessage>}
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
