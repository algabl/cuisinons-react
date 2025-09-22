import { and, eq } from "drizzle-orm";
import { z } from "zod/v4";

import { ingredients } from "@cuisinons/db/schema";

import { ingredientSchema, ingredientUpdateSchema } from "../schemas";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const ingredientRouter = createTRPCRouter({
  getByUserId: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.ingredients.findMany({
        where: (ingredients, { eq }) => eq(ingredients.createdById, input),
      });
    }),
  getWithRecipeUsage: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.ingredients.findMany({
        where: (ingredients, { eq }) => eq(ingredients.createdById, input),
        with: {
          recipeIngredients: {
            with: {
              recipe: {
                columns: {
                  id: true,
                  name: true,
                  createdById: true,
                },
              },
            },
          },
        },
      });
    }),
  create: protectedProcedure
    .input(ingredientSchema)
    .mutation(async ({ ctx, input }) => {
      const newIngredient = await ctx.db
        .insert(ingredients)
        .values({
          name: input.name,
          description: input.description,
          emoji: input.emoji,
          type: "user",
          createdById: ctx.auth.userId,
        })
        .returning();
      return {
        success: true,
        message: "Ingredient created successfully",
        data: newIngredient[0],
      };
    }),
  update: protectedProcedure
    .input(ingredientUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      // Ensure the ingredient exists and belongs to the user
      const existingIngredient = await ctx.db.query.ingredients.findFirst({
        where: (ingredients, { and, eq }) =>
          and(
            eq(ingredients.id, input.id),
            eq(ingredients.createdById, ctx.auth.userId ?? ""),
          ),
      });

      if (!existingIngredient) {
        throw new Error("Ingredient not found or access denied");
      }

      const updatedIngredient = await ctx.db
        .update(ingredients)
        .set({
          name: input.name,
          description: input.description,
          emoji: input.emoji,
        })
        .where(
          and(
            eq(ingredients.id, input.id),
            eq(ingredients.createdById, ctx.auth.userId ?? ""),
          ),
        )
        .returning();
      return {
        success: true,
        message: "Ingredient updated successfully",
        data: updatedIngredient[0],
      };
    }),
  getById: protectedProcedure
    .input(z.uuid({ message: "ID must be a UUID" }))
    .query(async ({ ctx, input }) => {
      const ingredient = await ctx.db.query.ingredients.findFirst({
        where: (ingredients, { eq }) => eq(ingredients.id, input),
      });
      // check to make sure the ingredient type is global or the createdById is the same as the user's ID
      if (
        ingredient?.type == "user" &&
        ingredient.createdById !== ctx.auth.userId
      ) {
        return null;
      }

      return ingredient;
    }),
  search: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const ingredients = await ctx.db.query.ingredients.findMany({
      where: (ingredients, { ilike, or, and, eq }) =>
        and(
          or(
            ilike(ingredients.name, `%${input}%`),
            ilike(ingredients.description, `%${input}%`),
          ),
          or(
            eq(ingredients.type, "global"),
            eq(ingredients.createdById, ctx.auth.userId ?? ""),
          ),
        ),
      limit: 10,
    });
    return ingredients;
  }),
  delete: protectedProcedure
    .input(z.uuid({ message: "ID must be a UUID" }))
    .mutation(async ({ ctx, input }) => {
      // First check if ingredient exists and belongs to user
      const existingIngredient = await ctx.db.query.ingredients.findFirst({
        where: (ingredients, { and, eq }) =>
          and(
            eq(ingredients.id, input),
            eq(ingredients.createdById, ctx.auth.userId ?? ""),
          ),
      });

      if (!existingIngredient) {
        throw new Error("Ingredient not found or access denied");
      }

      // Check if ingredient is used in any recipes
      const recipeUsage = await ctx.db.query.recipeIngredients.findFirst({
        where: (recipeIngredients, { eq }) =>
          eq(recipeIngredients.ingredientId, input),
      });

      if (recipeUsage) {
        throw new Error("Cannot delete ingredient that is used in recipes");
      }

      // Delete the ingredient
      await ctx.db
        .delete(ingredients)
        .where(
          and(
            eq(ingredients.id, input),
            eq(ingredients.createdById, ctx.auth.userId ?? ""),
          ),
        );

      return {
        success: true,
        message: "Ingredient deleted successfully",
      };
    }),
});
