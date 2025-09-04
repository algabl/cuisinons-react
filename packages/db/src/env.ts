import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod/v4";

export function dbEnv() {
  return createEnv({
    server: {
      NEON_DATABASE_URL: z.string().url(),
      NODE_ENV: z.enum(["development", "production"]),
    },
    experimental__runtimeEnv: {},
    skipValidation:
      !!process.env.CI || process.env.npm_lifecycle_event === "lint",
  });
}