import { z } from "zod/v4";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { groupMembers, groups } from "@cuisinons/db/schema";
import { eq, and } from "drizzle-orm";
import { clerkClient } from "@cuisinons/auth/server";
import { groupSchema } from "../schemas";

const groupCreateValidation = groupSchema.extend({
  emails: z
    .array(z.string().email({ message: "Invalid email address" }))
    .optional(),
});

export const groupRouter = {
  create: protectedProcedure
    .input(groupCreateValidation)
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
        userId: ctx.auth.userId ?? "",
        role: "owner",
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
          group: {
            with: {
              recipeSharings: true,
            },
          },
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
          groupMembers: true,
          recipeSharings: {
            with: {
              recipe: true,
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
      const client = await clerkClient();
      const users = await client.users.getUserList({
        emailAddress: [input.email],
      });
      const user = users.data[0];
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
  updateMember: protectedProcedure
    .input(
      z.object({
        groupId: z.string(),
        userId: z.string(),
        role: z.enum(["admin", "member", "owner"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const groupMember = await ctx.db.query.groupMembers.findFirst({
        where: (groupMembers, { and, eq }) =>
          and(
            eq(groupMembers.groupId, input.groupId),
            eq(groupMembers.userId, input.userId),
          ),
      });
      if (!groupMember) {
        throw new Error("User not in group");
      }
      await ctx.db
        .update(groupMembers)
        .set({ role: input.role })
        .where(
          and(
            eq(groupMembers.groupId, input.groupId),
            eq(groupMembers.userId, input.userId),
          ),
        );
    }),
  getMemberById: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        groupId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const groupMember = await ctx.db.query.groupMembers.findFirst({
        where: (groupMembers, { and, eq }) =>
          and(
            eq(groupMembers.groupId, input.groupId),
            eq(groupMembers.userId, input.userId),
          ),
      });
      if (!groupMember) {
        throw new Error("User not in group");
      }
      return groupMember;
    }),
};
