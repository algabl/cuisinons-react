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
      z.object({ name: z.string().min(1), description: z.string().nullable() }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(recipes).values({
        name: input.name,
        description: input.description,
        createdById: ctx.session.user.id,
      });
    }),
  getAll: publicProcedure.query(async ({ ctx }) => {
    const allRecipes = await ctx.db.query.recipes.findMany({
      orderBy: (recipes, { desc }) => [desc(recipes.createdAt)],
    });

    return allRecipes;
  }),
  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const recipe = await ctx.db.query.recipes.findFirst({
      orderBy: (recipes, { desc }) => [desc(recipes.createdAt)],
    });

    return recipe ?? null;
  }),
});
