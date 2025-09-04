import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { recipeSharings } from "@cuisinons/db/schema";
import { eq, and } from "drizzle-orm";

export const sharingRouter = createTRPCRouter({
  shareRecipeToGroup: protectedProcedure
    .input(z.object({ recipeId: z.string(), groupId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { recipeId, groupId } = input;
      const recipe = await ctx.db.query.recipes.findFirst({
        where: (recipes, { eq }) => eq(recipes.id, recipeId),
      });
      if (!recipe) {
        throw new Error("Recipe not found");
      }
      const group = await ctx.db.query.groups.findFirst({
        where: (groups, { eq }) => eq(groups.id, groupId),
      });
      if (!group) {
        throw new Error("Group not found");
      }
      await ctx.db.insert(recipeSharings).values({
        groupId,
        recipeId,
      });
    }),
  removeSharedRecipeFromGroup: protectedProcedure
    .input(z.object({ recipeId: z.string(), groupId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { recipeId, groupId } = input;
      const sharing = await ctx.db.query.recipeSharings.findFirst({
        where: (recipeSharings) =>
          and(
            eq(recipeSharings.recipeId, recipeId),
            eq(recipeSharings.groupId, groupId),
          ),
      });
      if (!sharing) {
        throw new Error("Recipe sharing not found");
      }
      await ctx.db
        .delete(recipeSharings)
        .where(
          and(
            eq(recipeSharings.recipeId, recipeId),
            eq(recipeSharings.groupId, groupId),
          ),
        );
    }),
});
