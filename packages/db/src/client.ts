import type { NeonQueryFunction } from "@neondatabase/serverless";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { dbEnv as env } from "./env";
import * as schema from "./schema";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  conn: NeonQueryFunction<false, false> | undefined;
};
// Use Neon connection string for drizzle
let conn;
if (env().NODE_ENV === "development") {
  globalForDb.conn ??= neon(env().NEON_DATABASE_URL);
  conn = globalForDb.conn;
} else {
  conn = neon(env().NEON_DATABASE_URL);
}

const db = drizzle(conn, { schema });

export { db };
