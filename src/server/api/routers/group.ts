import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { groups } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";

export const createValidation = z.object({
  name: z.string().min(1, { message: "Name is required" }),
});

export const groupRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createValidation)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(groups).values({
        name: input.name,
      });
    }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const allGroups = await ctx.db.query.groups.findMany({
      orderBy: (groups, { asc }) => [asc(groups.name)],
    });
    return allGroups;
  }),
});
