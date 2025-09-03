import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { ingredients } from "@cuisinons/db/schema";
import { ingredientSchema } from "../schemas";

export const ingredientRouter = createTRPCRouter({
  getByUserId: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const ingredients = await ctx.db.query.ingredients.findMany({
        where: (ingredients, { eq }) => eq(ingredients.createdById, input),
      });
      return ingredients;
    }),
  create: protectedProcedure
    .input(ingredientSchema)
    .mutation(async ({ ctx, input }) => {
      const newIngredient = await ctx.db
        .insert(ingredients)
        .values({
          name: input.name,
          description: input.description,
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
  getById: protectedProcedure
    .input(z.string().uuid({ message: "ID must be a UUID" }))
    .query(async ({ ctx, input }) => {
      const ingredient = await ctx.db.query.ingredients.findFirst({
        where: (ingredients, { eq }) => eq(ingredients.id, input),
      });
      // check to make sure the ingredient type is global or the createdById is the same as the user's ID
      if (
        ingredient?.type == "user" &&
        ingredient?.createdById !== ctx.auth.userId
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
            eq(ingredients.createdById, ctx.auth.userId),
          ),
        ),
      limit: 10,
    });
    return ingredients;
  }),
});
