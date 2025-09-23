import type { FileRouter } from "uploadthing/next";
import { stageSchema } from "@cuisinons/api/schemas";
import { createUploadthing } from "uploadthing/next";
import z from "zod/v4";

import { stageFile } from "@cuisinons/api/services";
import { createTRPCContext } from "@cuisinons/api/trpc";
import { getCurrentUser } from "@cuisinons/auth/server";

const f = createUploadthing();

export const uploadRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .input(z.object({ stageId: z.string() })) // metadata schema
    .middleware(async ({ input }) => {
      const user = await getCurrentUser();
      if (!user) throw new Error("Unauthorized");
      return { userId: user.id, ...input };
    })
    .onUploadComplete(async ({ metadata, file, req }) => {
      const ctx = await createTRPCContext({ headers: req.headers });
      // This code RUNS ON YOUR SERVER after upload
      // stage the uploaded image

      const input = stageSchema.parse({
        url: file.ufsUrl,
        key: file.key,
        filename: file.name,
        size: file.size,
        mimeType: file.type,
        stageId: metadata.stageId,
        userId: metadata.userId,
      });

      const result = await stageFile(input, ctx);

      return { fileId: result[0]?.id };
    }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
