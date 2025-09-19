import { and, eq, lt } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import { z } from "zod/v4";

import { stagedFiles } from "@cuisinons/db/schema";

import { publishStagedFiles, stageFile } from "../services/upload";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { stageSchema } from "../schemas/upload";

// Helper function to determine file type from MIME type
function getFileTypeFromMimeType(
  mimeType: string,
): "image" | "document" | "video" | "audio" | "other" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (
    mimeType.includes("pdf") ||
    mimeType.includes("document") ||
    mimeType.includes("text") ||
    mimeType.includes("application/")
  ) {
    return "document";
  }
  return "other";
}

export const uploadRouter = createTRPCRouter({
  // Stage a file upload
  stageFile: protectedProcedure
    .input(
      stageSchema
    )
    .mutation(async ({ ctx, input }) => {
      const staged = await stageFile(input, ctx);

      return {
        success: true,
        message: "File staged successfully",
        data: staged[0],
      };
    }),

  // Publish staged files when parent entity is saved
  publishStagedFiles: protectedProcedure
    .input(
      z.object({
        stageId: z.string(),
        entityId: z.string(), // ID of the entity these files belong to (e.g., recipe ID)
        entityType: z.string().optional(), // Type of entity for future reference
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Update staged files to published
      const publishedFiles = await publishStagedFiles(input, ctx);
      return {
        success: true,
        message: "Staged files published successfully",
        data: { publishedCount: publishedFiles.length, files: publishedFiles },
      };
    }),

  // Clean up abandoned staged files
  cleanupStaged: protectedProcedure
    .input(z.object({ stageId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const utapi = new UTApi();
      const filesToCleanup = await ctx.db.query.stagedFiles.findMany({
        where: (sf, { eq, and }) =>
          and(
            eq(sf.stageId, input.stageId),
            eq(sf.userId, ctx.auth.userId ?? ""),
            eq(sf.status, "staged"),
          ),
      });

      console.log(
        `Cleaning up ${filesToCleanup.length} staged files for stageId ${input.stageId}`,
      );

      // Delete from blob storage
      const { success, deletedCount } = await utapi.deleteFiles(
        filesToCleanup.map((f) => f.key),
      );

      console.log(`Deleted ${deletedCount} files from blob storage`);

      if (!success) {
        console.error("Failed to delete staged files from blob storage:");
      }

      // Mark as deleted in DB
      await ctx.db
        .update(stagedFiles)
        .set({ status: "deleted" })
        .where(
          and(
            eq(stagedFiles.stageId, input.stageId),
            eq(stagedFiles.userId, ctx.auth.userId ?? ""),
          ),
        );

      return {
        success: true,
        message: "Staged files cleaned up successfully",
        data: { deletedCount },
      };
    }),

  // Get staged files for a stage
  getStagedFiles: protectedProcedure
    .input(
      z.object({
        stageId: z.string(),
        fileType: z
          .enum(["image", "document", "video", "audio", "other"])
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const whereConditions = [
        eq(stagedFiles.stageId, input.stageId),
        eq(stagedFiles.userId, ctx.auth.userId ?? ""),
        eq(stagedFiles.status, "staged"),
      ];

      if (input.fileType) {
        whereConditions.push(eq(stagedFiles.fileType, input.fileType));
      }

      const files = await ctx.db.query.stagedFiles.findMany({
        where: (sf, { eq, and }) => and(...whereConditions),
        orderBy: (sf, { desc }) => [desc(sf.createdAt)],
      });

      return files;
    }),

  // Clean up expired files (for background jobs)
  cleanupExpired: protectedProcedure.mutation(async ({ ctx }) => {
    // Only allow this for admin users or system processes
    // You might want to add additional authorization here
    const utapi = new UTApi();

    const expiredFiles = await ctx.db.query.stagedFiles.findMany({
      where: (sf, { lt, eq, and }) =>
        and(lt(sf.expiresAt, new Date()), eq(sf.status, "staged")),
    });

    const { success, deletedCount } = await utapi.deleteFiles(
      expiredFiles.map((f) => f.key),
    );

    if (!success) {
      console.error("Failed to delete expired files from blob storage:");
    }

    // Mark as deleted in DB
    await ctx.db
      .update(stagedFiles)
      .set({ status: "deleted" })
      .where(
        and(
          lt(stagedFiles.expiresAt, new Date()),
          eq(stagedFiles.status, "staged"),
        ),
      );

    return {
      success: true,
      message: "Expired files cleaned up successfully",
      data: { deletedCount },
    };
  }),

  // Delete a specific staged file
  deleteStagedFile: protectedProcedure
    .input(z.object({ fileId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const utapi = new UTApi();
      // Find the file first to ensure ownership
      const file = await ctx.db.query.stagedFiles.findFirst({
        where: (sf, { eq, and }) =>
          and(eq(sf.id, input.fileId), eq(sf.userId, ctx.auth.userId ?? "")),
      });

      if (!file) {
        throw new Error(
          "File not found or you do not have permission to delete it.",
        );
      }

      // Delete from blob storage

      const { success } = await utapi.deleteFiles([file.key]);

      if (!success) {
        console.error("Failed to delete staged file from blob storage:");
      }

      // Mark as deleted in DB
      await ctx.db
        .update(stagedFiles)
        .set({ status: "deleted" })
        .where(eq(stagedFiles.id, input.fileId));

      return {
        success: true,
        message: "File deleted successfully",
      };
    }),
});
