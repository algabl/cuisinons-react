import { type Config } from "drizzle-kit";
import path from "path";

if (!process.env.NEON_DATABASE_URL) {
  throw new Error("Missing NEON_DATABASE_URL");
}

export default {
    schema: path.resolve(__dirname, "./src/schema.ts"),
    dialect: "postgresql",
  dbCredentials: {
    url: process.env.NEON_DATABASE_URL,
  },
  tablesFilter: ["cuisinons_*"],
} satisfies Config;
