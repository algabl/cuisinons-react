import { UTApi } from "uploadthing/server";
import { z } from "zod/v4";

import { and, eq, inArray, ne } from "@cuisinons/db";
import {
  recipeIngredients,
  recipes,
  recipeSharings,
  stagedFiles,
} from "@cuisinons/db/schema";

import {
  recipeApiSchema,
  recipeIngredientRelationSchema,
  recipeUpdateSchema,
} from "../schemas";
import { publishStagedFiles } from "../services/upload";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const recipeRouter = createTRPCRouter({
  create: protectedProcedure
    .input(recipeApiSchema)
    .mutation(async ({ ctx, input }) => {
      console.log(input);
      // use upload function
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
      console.log(created);
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
          imageId: input.imageId,

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

      console.log("Stage ID", input.stageId);
      console.log("Existing Image ID", existingRecipe.imageId);
      console.log("New Image ID", input.imageId);
      console.log("Recipe ID", existingRecipe.id);
      if (input.stageId) {
        if (existingRecipe.imageId !== input.imageId) {
          // Remove any files associated with this recipe, staged or published, that don't match the new imageId
          console.log("Cleaning up old images");
          const utapi = new UTApi();
          const filesToDelete = await ctx.db.query.stagedFiles.findMany({
            where: (sf, { eq, ne }) =>
              and(
                eq(sf.entityId, existingRecipe.id),
                eq(sf.entityType, "recipe"),
                eq(sf.userId, ctx.auth.userId ?? ""),
                inArray(sf.status, ["staged", "published"]),
                ne(sf.id, input.imageId ?? ""),
              ),
          });
          console.log("Files to delete:", filesToDelete);
          if (filesToDelete.length > 0) {
            const map = filesToDelete.map((file) => file.key);
            const { success, deletedCount } = await utapi.deleteFiles(map);
            console.log("Blob deletion result:", { success, deletedCount });
          }

          await ctx.db
            .update(stagedFiles)
            .set({ status: "deleted" })
            .where(
              and(
                eq(stagedFiles.entityId, existingRecipe.id),
                eq(stagedFiles.entityType, "recipe"),
                eq(stagedFiles.userId, ctx.auth.userId ?? ""),
                inArray(stagedFiles.status, ["staged", "published"]),
                ne(stagedFiles.id, input.imageId ?? ""),
              ),
            );
        }
        const result = await publishStagedFiles(
          {
            stageId: input.stageId,
            entityId: existingRecipe.id,
            entityType: "recipe",
          },
          ctx,
        );
        console.log("Published staged files:", result);
      }

      return { success: true, message: "Recipe updated successfully" };
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const utapi = new UTApi();
      // Delete recipe image from blob storage if it exists
      const existingImage = await ctx.db.query.stagedFiles.findFirst({
        where: (sf, { eq }) =>
          and(
            eq(sf.entityId, input.id),
            eq(sf.entityType, "recipe"),
            eq(sf.status, "published"),
            eq(sf.userId, ctx.auth.userId ?? ""),
          ),
      });

      if (existingImage) {
        try {
          await utapi.deleteFiles([existingImage.key]);
        } catch (error) {
          console.error("Error deleting image from blob storage:", error);
        }
      }

      await ctx.db
        .update(stagedFiles)
        .set({ status: "deleted" })
        .where(
          and(
            eq(stagedFiles.entityId, input.id),
            eq(stagedFiles.entityType, "recipe"),
            eq(stagedFiles.userId, ctx.auth.userId ?? ""),
            eq(stagedFiles.status, "staged"),
          ),
        );

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
      return { success: true, message: "Recipe deleted successfully" };
    }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.userId;
    const recipes = await ctx.db.query.recipes.findMany({
      where: (recipes, { eq }) => eq(recipes.createdById, userId ?? ""),
      orderBy: (recipes, { desc }) => [desc(recipes.createdAt)],
      with: {
        stagedFile: true,
      },
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
  getById: publicProcedure
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
          stagedFile: true,
        },
      });

      if (recipe?.isPrivate && recipe.createdById !== ctx.auth.userId) {
        // Check if shared with a group the user is in
        const shared = await ctx.db.query.recipeSharings.findFirst({
          where: (rs, { eq }) =>
            and(
              eq(rs.recipeId, recipe.id),
              eq(rs.groupId, ctx.auth.userId ?? ""),
            ),
        });
        if (!shared) {
          return null;
        }
      }

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
