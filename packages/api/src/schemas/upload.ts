import z from "zod/v4";

export const publishSchema = z.object({
  stageId: z.string(),
  entityId: z.string(), // ID of the entity these files belong to (e.g., recipe ID)
  entityType: z.string().optional(), // Type of entity for future reference
});

export const stageSchema = z.object({
  url: z.string(),
  key: z.string(), // Unique file identifier in blob storage
  filename: z.string().optional(),
  size: z.number().optional(),
  mimeType: z.string().optional(),
  stageId: z.string(), // Generated client-side UUID
  // metadata: z.record(z.any(), z.any()).optional(), // Additional file metadata
  expiresInHours: z.number().min(1).max(72).default(24), // Default 24h expiry
  userId: z.string().optional(), // Populated server-side
});

export type PublishInput = z.infer<typeof publishSchema>;
export type StageInput = z.infer<typeof stageSchema>;