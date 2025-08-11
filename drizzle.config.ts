import { type Config } from "drizzle-kit";

import { env } from "~/env";

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.NEON_DATABASE_URL,
  },
  tablesFilter: ["cuisinons_*"],
} satisfies Config;
