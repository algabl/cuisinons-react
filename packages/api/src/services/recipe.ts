import { recipeIngredients, recipes } from "@cuisinons/db/schema";

import type { RecipeApiData } from "../schemas";
import type { Context } from "../trpc";
import { publishStagedFiles } from "./upload";

export async function createRecipe(input: RecipeApiData, ctx: Context) {
  const created = await ctx.db
    .insert(recipes)
    .values({
      name: input.name,
      description: input.description,
      imageId: input.imageId,
      createdById: ctx.auth.userId ?? "",

      // Time fields
      cookingTime: input.cookingTime,
      preparationTime: input.preparationTime,
      totalTime: input.totalTime,

      // Yield
      servings: input.servings,

      // Nutrition
      calories: input.calories,
      fat: input.fat,
      protein: input.protein,
      carbohydrates: input.carbohydrates,
      fiber: input.fiber,
      sugar: input.sugar,
      sodium: input.sodium,

      // Categories
      recipeCategory: input.recipeCategory,
      recipeCuisine: input.recipeCuisine,
      keywords: input.keywords,

      // Difficulty
      difficulty: input.difficulty,
      skillLevel: input.skillLevel,

      // Dietary
      suitableForDiet: input.suitableForDiet,

      // Equipment
      recipeEquipment: input.recipeEquipment,

      // Cost
      estimatedCost: input.estimatedCost,

      // Existing fields
      instructions: input.instructions,
      isPrivate: input.isPrivate,
    })
    .returning();

  if (!created[0]) {
    throw new Error("Failed to create recipe");
  }

  const recipeId = created[0].id;

  if (input.recipeIngredients && recipeId) {
    // Use Promise.all for better performance
    await Promise.all(
      input.recipeIngredients.map((ingredient) =>
        ctx.db.insert(recipeIngredients).values({
          recipeId: recipeId,
          ingredientId: ingredient.ingredientId,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          userId: ctx.auth.userId,
        }),
      ),
    );
  }

  // Publish any staged files associated with this recipe
  if (input.stageId && recipeId) {
    await publishStagedFiles(
      {
        stageId: input.stageId,
        entityId: recipeId,
        entityType: "recipe",
      },
      ctx,
    );
  }
  return {
    success: true,
    message: "Recipe created successfully",
    data: created[0].id,
  };
}
