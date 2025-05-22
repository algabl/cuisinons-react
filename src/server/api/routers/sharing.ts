import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { recipeSharings } from "~/server/db/schema";

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
});
