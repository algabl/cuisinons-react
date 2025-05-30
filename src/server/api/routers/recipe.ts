import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { recipeIngredients, recipes, recipeSharings } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";

export const createValidation = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().optional(),
  image: z
    .string()
    .optional()
    .refine((val) => !val || z.string().url().safeParse(val).success, {
      message: "Must be a valid URL",
    }),
  cookingTime: z.coerce.number().int().positive().optional(),
  preparationTime: z.coerce.number().int().positive().optional(),
  servings: z.coerce.number().int().positive().optional(),
  calories: z.coerce.number().int().positive().optional(),
  instructions: z.string().array().optional(),
  isPrivate: z.boolean().optional(),
});

const ingredientValidation = z.object({
  recipeId: z.string().uuid("Recipe ID must be a valid UUID"),
  ingredientId: z.string().uuid("Ingredient ID must be a valid UUID"),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  unit: z.string().optional(),
});

export const recipeRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createValidation)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(recipes).values({
        name: input.name,
        description: input.description,
        image: input.image,
        createdById: ctx.session.user.id,
        cookingTime: input.cookingTime,
        preparationTime: input.preparationTime,
        servings: input.servings,
        calories: input.calories,
        instructions: input.instructions,
      });
      return { success: true, message: "Recipe created successfully" };
    }),
  update: protectedProcedure
    .input(
      createValidation.extend({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(recipes)
        .set({
          name: input.name,
          description: input.description,
          image: input.image,
          cookingTime: input.cookingTime,
          preparationTime: input.preparationTime,
          servings: input.servings,
          calories: input.calories,
          instructions: input.instructions,
        })
        .where(
          and(
            eq(recipes.id, input.id),
            eq(recipes.createdById, ctx.session.user.id),
          ),
        );
      return { success: true, message: "Recipe updated successfully" };
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(recipes)
        .where(
          and(
            eq(recipes.id, input.id),
            eq(recipes.createdById, ctx.session.user.id),
          ),
        );
    }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const allRecipes = await ctx.db.query.recipes.findMany({
      orderBy: (recipes, { desc }) => [desc(recipes.createdAt)],
    });
    return allRecipes;
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
    .input(ingredientValidation)
    .mutation(async ({ ctx, input }) => {
      // check that the recipe exists and belongs to the user
      const recipe = await ctx.db.query.recipes.findFirst({
        where: (recipes, { eq }) =>
          and(
            eq(recipes.id, input.recipeId),
            eq(recipes.createdById, ctx.session.user.id),
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
            eq(ingredients.createdById, ctx.session.user.id),
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
          userId: ctx.session.user.id,
        })
        .returning();
      return {
        success: true,
        message: "Ingredient added to recipe successfully",
        data: response[0],
      };
    }),
});
