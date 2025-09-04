import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod/v4";

import {
  recipeIngredients,
  recipes,
  recipeSharings,
} from "@cuisinons/db/schema";

import {
  ingredientSchema,
  recipeApiSchema,
  recipeIngredientRelationSchema,
  recipeUpdateSchema,
} from "../schemas";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const recipeRouter = createTRPCRouter({
  create: protectedProcedure
    .input(recipeApiSchema)
    .mutation(async ({ ctx, input }) => {
      console.log(input);
      return await ctx.db.transaction(async (tx) => {
        const created = await ctx.db
          .insert(recipes)
          .values({
            name: input.name,
            description: input.description,
            image: input.image,
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
            input.recipeIngredients.map(ingredient =>
              tx.insert(recipeIngredients).values({
                recipeId: recipeId,
                ingredientId: ingredient.ingredientId,
                quantity: ingredient.quantity,
                unit: ingredient.unit,
                userId: ctx.auth.userId,
              })
            )
          );
        }
        return {
          success: true,
          message: "Recipe created successfully",
          data: created[0].id,
        };
      });
    }),
  update: protectedProcedure
    .input(recipeUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      // Get existing recipe to check ownership
      const existingRecipe = await ctx.db.query.recipes.findFirst({
        where: (recipes, { eq }) =>
          and(
            eq(recipes.id, input.id),
            eq(recipes.createdById, ctx.auth.userId ?? ""),
          ),
        with: {
          recipeIngredients: true,
        },
      });

      if (!existingRecipe) {
        throw new Error(
          "Recipe not found or you do not have permission to edit it.",
        );
      }

      // Update recipeIngredients.
      // First, check for existing ingredients and update them
      const existingIngredients = existingRecipe.recipeIngredients.map(
        (ri) => ri.ingredientId,
      );

      const newIngredients =
        input.recipeIngredients?.map((ingredient) => ingredient.ingredientId) ??
        [];

      // Remove ingredients that are no longer in the recipe
      const ingredientsToRemove = existingIngredients.filter(
        (ingredientId) => !newIngredients.includes(ingredientId),
      );

      if (ingredientsToRemove.length > 0) {
        await ctx.db
          .delete(recipeIngredients)
          .where(
            and(
              eq(recipeIngredients.recipeId, input.id),
              inArray(recipeIngredients.ingredientId, ingredientsToRemove),
            ),
          );
      }

      // Add or update ingredients
      if (input.recipeIngredients) {
        for (const ingredient of input.recipeIngredients) {
          const existingIngredient = existingRecipe.recipeIngredients.find(
            (ri) => ri.ingredientId === ingredient.ingredientId,
          );

          if (existingIngredient) {
            // Update existing ingredient
            await ctx.db
              .update(recipeIngredients)
              .set({
                quantity: ingredient.quantity,
                unit: ingredient.unit,
              })
              .where(
                and(
                  eq(recipeIngredients.recipeId, input.id),
                  eq(recipeIngredients.ingredientId, ingredient.ingredientId),
                ),
              );
          } else {
            // Insert new ingredient
            await ctx.db.insert(recipeIngredients).values({
              recipeId: input.id,
              ingredientId: ingredient.ingredientId,
              quantity: ingredient.quantity,
              unit: ingredient.unit,
              userId: ctx.auth.userId,
            });
          }
        }
      }

      await ctx.db
        .update(recipes)
        .set({
          name: input.name,
          description: input.description,
          image: input.image,

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
        .where(
          and(
            eq(recipes.id, input.id),
            eq(recipes.createdById, ctx.auth.userId ?? ""),
          ),
        );
      return { success: true, message: "Recipe updated successfully" };
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Delete recipe ingredients
      await ctx.db
        .delete(recipeIngredients)
        .where(
          and(
            eq(recipeIngredients.recipeId, input.id),
            eq(recipeIngredients.userId, ctx.auth.userId ?? ""),
          ),
        );
      await ctx.db
        .delete(recipes)
        .where(
          and(
            eq(recipes.id, input.id),
            eq(recipes.createdById, ctx.auth.userId ?? ""),
          ),
        );
    }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.userId;
    const recipes = await ctx.db.query.recipes.findMany({
      where: (recipes, { eq }) => eq(recipes.createdById, userId ?? ""),
      orderBy: (recipes, { desc }) => [desc(recipes.createdAt)],
    });
    return recipes;
  }),
  getByUserId: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const recipes = await ctx.db.query.recipes.findMany({
        where: (recipes, { eq }) => eq(recipes.createdById, input.userId),
        orderBy: (recipes, { desc }) => [desc(recipes.createdAt)],
      });
      return recipes;
    }),
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const recipe = await ctx.db.query.recipes.findFirst({
        where: (recipes, { eq }) => eq(recipes.id, input.id),
        with: {
          recipeSharings: true,
          recipeIngredients: {
            with: {
              ingredient: true,
            },
          },
        },
      });

      return recipe ?? null;
    }),
  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const recipe = await ctx.db.query.recipes.findFirst({
      orderBy: (recipes, { desc }) => [desc(recipes.createdAt)],
    });

    return recipe ?? null;
  }),
  shareWithGroup: protectedProcedure
    .input(
      z.object({
        recipeId: z.string(),
        groupId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(recipeSharings).values({
        recipeId: input.recipeId,
        groupId: input.groupId,
      });
    }),
  addIngredient: protectedProcedure
    .input(recipeIngredientRelationSchema)
    .mutation(async ({ ctx, input }) => {
      // Ensure ctx.auth has a type with userId as string

      // check that the recipe exists and belongs to the user
      const recipe = await ctx.db.query.recipes.findFirst({
        where: (recipes, { eq }) =>
          and(
            eq(recipes.id, input.recipeId),
            eq(recipes.createdById, ctx.auth.userId ?? ""),
          ),
      });
      if (!recipe) {
        throw new Error(
          "Recipe not found or you do not have permission to edit it.",
        );
      }

      // Check if the ingredient is global or created by the user
      const ingredient = await ctx.db.query.ingredients.findFirst({
        where: (ingredients, { eq, or }) =>
          or(
            eq(ingredients.type, "global"),
            eq(ingredients.createdById, ctx.auth.userId ?? ""),
          ),
      });

      if (!ingredient) {
        throw new Error("Ingredient not found or you do not have permission.");
      }

      const response = await ctx.db
        .insert(recipeIngredients)
        .values({
          recipeId: input.recipeId,
          ingredientId: input.ingredientId,
          quantity: input.quantity,
          unit: input.unit,
          userId: ctx.auth.userId,
        })
        .returning();
      return {
        success: true,
        message: "Ingredient added to recipe successfully",
        data: response[0],
      };
    }),
});

type DebugRecipeRouter = typeof recipeRouter;