import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { and, eq, ilike, isNull } from "drizzle-orm";
import { groupMembers } from "~/server/db/schema";
import { clerkClient } from "@clerk/nextjs/server";

export const userRouter = createTRPCRouter({
  searchByEmail: protectedProcedure
    .input(z.object({ email: z.string() }))
    .query(async ({ input }) => {
      const client = await clerkClient();

      const { email } = input;

      try {
        const clerkUsers = await client.users.getUserList({
          query: email,
          limit: 5,
        });
        return clerkUsers.data.map((user) => ({
          id: user.id,
          emailAddress: user.primaryEmailAddress?.emailAddress ?? "",
          fullName: user.fullName,
          imageUrl: user.imageUrl,
        }));
      } catch (error) {
        console.error("Error fetching users from Clerk:", error);
        throw new Error("Failed to fetch users from Clerk");
      }
      // if (groupId) {
      //   // When joining, Drizzle returns { users: ..., groupMembers: ... }
      //   const rows = await ctx.db
      //     .select()
      //     .from(users)
      //     .leftJoin(
      //       groupMembers,
      //       and(
      //         eq(users.id, groupMembers.userId),
      //         eq(groupMembers.groupId, groupId),
      //       ),
      //     )
      //     .where(
      //       and(ilike(users.email, `%${email}%`), isNull(groupMembers.groupId)),
      //     );
      //   // Map to just the user object
      //   usersResult = rows.map((row) => row.user);
      // } else {
      //   usersResult = await ctx.db
      //     .select()
      //     .from(users)
      //     .where(ilike(users.email, `%${email}%`));
      // }
      // return usersResult;
    }),
  getById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const client = await clerkClient();
      const user = await client.users.getUser(input);
      if (!user) {
        throw new Error("User not found");
      }

      const userGroupMemberships = await ctx.db
        .select()
        .from(groupMembers)
        .where(eq(groupMembers.userId, input));
      return {
        groupMembers: userGroupMemberships,
        ...user,
      };
    }),
  getByIds: protectedProcedure
    .input(z.array(z.string()))
    .query(async ({ ctx, input }) => {
      const client = await clerkClient();
      const users = await client.users.getUserList({
        userId: input,
      });

      if (!users.data.length) {
        throw new Error("No users found");
      }

      return users;
    }),
});
