import { and, eq } from "@cuisinons/db";
import { stagedFiles } from "@cuisinons/db/schema";

import type { PublishInput, StageInput } from "../schemas/upload";
import type { Context } from "../trpc";

export async function publishStagedFiles(input: PublishInput, ctx: Context) {
  return await ctx.db
    .update(stagedFiles)
    .set({
      status: "published",
      entityId: input.entityId,
      entityType: input.entityType,
    })
    .where(
      and(
        eq(stagedFiles.stageId, input.stageId),
        eq(stagedFiles.userId, ctx.auth.userId ?? ""),
        eq(stagedFiles.status, "staged"),
      ),
    )
    .returning();
}

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

export async function stageFile(input: StageInput, ctx: Context) {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + input.expiresInHours);
  const fileType = input.mimeType
    ? getFileTypeFromMimeType(input.mimeType)
    : "other";
  return await ctx.db
    .insert(stagedFiles)
    .values({
      url: input.url,
      key: input.key,
      filename: input.filename,
      size: input.size,
      mimeType: input.mimeType,
      fileType,
      stageId: input.stageId,
      userId: ctx.auth.userId ?? input.userId ?? "",
      expiresAt,
    })
    .returning();
}
