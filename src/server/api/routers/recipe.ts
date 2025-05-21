import type { get } from "http";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { recipes } from "~/server/db/schema";
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
