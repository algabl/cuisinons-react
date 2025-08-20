import { type Config } from "drizzle-kit";

if (!process.env.NEON_DATABASE_URL) {
  throw new Error("Missing NEON_DATABASE_URL");
}

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.NEON_DATABASE_URL,
  },
  tablesFilter: ["cuisinons_*"],
} satisfies Config;
