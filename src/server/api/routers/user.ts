import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { and, eq, ilike, isNull } from "drizzle-orm";
import { groupMembers, users } from "~/server/db/schema";

export const userRouter = createTRPCRouter({
  searchByEmail: protectedProcedure
    .input(z.object({ email: z.string(), groupId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const { email, groupId } = input;

      let usersResult;
      if (groupId) {
        // When joining, Drizzle returns { users: ..., groupMembers: ... }
        const rows = await ctx.db
          .select()
          .from(users)
          .leftJoin(
            groupMembers,
            and(
              eq(users.id, groupMembers.userId),
              eq(groupMembers.groupId, groupId),
            ),
          )
          .where(
            and(ilike(users.email, `%${email}%`), isNull(groupMembers.groupId)),
          );
        // Map to just the user object
        usersResult = rows.map((row) => row.user);
      } else {
        usersResult = await ctx.db
          .select()
          .from(users)
          .where(ilike(users.email, `%${email}%`));
      }
      return usersResult;
    }),
});
