import { clerkClient } from "@cuisinons/auth/server";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";

import { groupMembers } from "@cuisinons/db/schema";

import { createTRPCRouter, protectedProcedure } from "../trpc";

// Zod schemas for validation and type inference
const groupMemberSchema = z.object({
  groupId: z.string(),
  userId: z.string(),
  role: z.enum(["admin", "member", "owner"]).nullable(),
});

const baseUserSchema = z.object({
  id: z.string(),
  emailAddress: z.string(),
  fullName: z.string().nullable(),
  imageUrl: z.string(),
});

const userWithOptionalEmailSchema = baseUserSchema.extend({
  emailAddress: z.string().optional(),
});

const userWithGroupMembershipsSchema = userWithOptionalEmailSchema.extend({
  groupMembers: z.array(groupMemberSchema),
});

const usersListResultSchema = z.object({
  data: z.array(userWithOptionalEmailSchema),
  totalCount: z.number(),
});

// Infer types from schemas
type UserSearchResult = z.infer<typeof baseUserSchema>;
type UserWithGroupMemberships = z.infer<typeof userWithGroupMembershipsSchema>;
type UsersListResult = z.infer<typeof usersListResultSchema>;

export const userRouter = createTRPCRouter({
  searchByEmail: protectedProcedure
    .input(z.object({ email: z.string() }))
    .query(async ({ input }): Promise<UserSearchResult[]> => {
      const client = await clerkClient();

      const { email } = input;

      try {
        const clerkUsers = await client.users.getUserList({
          query: email,
          limit: 5,
        });

        // Validate and transform the data using our schema
        const results = clerkUsers.data.map((user) => {
          const userData = {
            id: user.id,
            emailAddress: user.primaryEmailAddress?.emailAddress ?? "",
            fullName: user.fullName,
            imageUrl: user.imageUrl,
          };
          return baseUserSchema.parse(userData);
        });

        return results;
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
    .query(async ({ ctx, input }): Promise<UserWithGroupMemberships> => {
      const client = await clerkClient();
      const user = await client.users.getUser(input);

      const userGroupMemberships = await ctx.db
        .select()
        .from(groupMembers)
        .where(eq(groupMembers.userId, input));

      // Validate group memberships
      const validatedGroupMembers = userGroupMemberships.map((member) =>
        groupMemberSchema.parse(member),
      );

      // Build and validate the complete user object
      const userData = {
        id: user.id,
        emailAddress: user.primaryEmailAddress?.emailAddress,
        fullName: user.fullName,
        imageUrl: user.imageUrl,
        groupMembers: validatedGroupMembers,
      };

      return userWithGroupMembershipsSchema.parse(userData);
    }),
  getByIds: protectedProcedure
    .input(z.array(z.string()))
    .query(async ({ input }): Promise<UsersListResult> => {
      const client = await clerkClient();
      const users = await client.users.getUserList({
        userId: input,
      });

      // Validate and transform each user
      const validatedData = users.data.map((user) => {
        const userData = {
          id: user.id,
          emailAddress: user.primaryEmailAddress?.emailAddress,
          fullName: user.fullName,
          imageUrl: user.imageUrl,
        };
        return userWithOptionalEmailSchema.parse(userData);
      });

      const result = {
        data: validatedData,
        totalCount: users.totalCount,
      };

      return usersListResultSchema.parse(result);
    }),
});
