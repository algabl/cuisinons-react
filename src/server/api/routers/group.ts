import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { groupMembers, groups } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import { db } from "~/server/db";
import { addMember } from "~/app/actions";

export const createValidation = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  emails: z
    .array(z.string().email({ message: "Invalid email address" }))
    .optional(),
});

export const groupRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createValidation)
    .mutation(async ({ ctx, input }) => {
      const [createdGroup] = await ctx.db
        .insert(groups)
        .values({ name: input.name })
        .returning();

      if (!createdGroup) {
        throw new Error("Failed to create group");
      }
      await ctx.db.insert(groupMembers).values({
        groupId: createdGroup.id,
        userId: ctx.session.user.id,
        role: "admin",
      });
      return createdGroup.id;
    }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const allGroups = await ctx.db.query.groups.findMany({
      orderBy: (groups, { asc }) => [asc(groups.name)],
    });
    return allGroups;
  }),
  getByUserId: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const groupsByUserId = await ctx.db.query.groupMembers.findMany({
        where: (groupMembers, { eq }) => eq(groupMembers.userId, input),
        with: {
          group: true,
        },
        orderBy: (groupMembers, { asc }) => [asc(groupMembers.groupId)],
      });
      return groupsByUserId.map((groupMember) => ({
        ...groupMember.group,
        role: groupMember.role,
      }));
    }),
  getById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const group = await ctx.db.query.groups.findFirst({
        where: (groups, { eq }) => eq(groups.id, input),
        with: {
          groupMembers: {
            with: {
              user: true,
            },
          },
        },
      });
      return group;
    }),
  addMember: protectedProcedure
    .input(
      z.object({
        groupId: z.string(),
        email: z.string(),
        role: z.enum(["admin", "member"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, input.email),
      });
      if (!user) {
        throw new Error("User not found");
      }
      const groupMember = await ctx.db.query.groupMembers.findFirst({
        where: (groupMembers, { and, eq }) =>
          and(
            eq(groupMembers.groupId, input.groupId),
            eq(groupMembers.userId, user.id),
          ),
      });
      if (groupMember) {
        throw new Error("User already in group");
      }
      await ctx.db.insert(groupMembers).values({
        groupId: input.groupId,
        userId: user.id,
        role: input.role,
      });
    }),
});
