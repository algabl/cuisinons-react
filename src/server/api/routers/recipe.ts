import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { recipes } from "~/server/db/schema";

export const recipeRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().nullable(),
        image: z.string().url().optional(),
        cookingTime: z.coerce.number().int().positive().optional(),
        preparationTime: z.coerce.number().int().positive().optional(),
        servings: z.coerce.number().int().positive().optional(),
        calories: z.coerce.number().int().positive().optional(),
        instructions: z.string().array().optional(),
      }),
    )
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
    }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const allRecipes = await ctx.db.query.recipes.findMany({
      orderBy: (recipes, { desc }) => [desc(recipes.createdAt)],
    });
    return allRecipes;
  }),
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const recipe = await ctx.db.query.recipes.findFirst({
        where: (recipes, { eq }) => eq(recipes.id, input.id),
      });

      return recipe ?? null;
    }),
  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const recipe = await ctx.db.query.recipes.findFirst({
      orderBy: (recipes, { desc }) => [desc(recipes.createdAt)],
    });

    return recipe ?? null;
  }),
});
