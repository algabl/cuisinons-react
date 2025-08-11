import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { neon } from "@neondatabase/serverless";
import { drizzle as neonDrizzle } from "drizzle-orm/neon-http";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { env } from "~/env";
import * as schema from "./schema";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

let db: NeonHttpDatabase<typeof schema> | PostgresJsDatabase<typeof schema>;
let conn;

if (env.NODE_ENV === "production") {
  conn = neon(env.NEON_DATABASE_URL);
  db = neonDrizzle(conn, { schema });
} else {
  conn = globalForDb.conn ?? postgres(env.NEON_DATABASE_URL, { max: 1 });
  globalForDb.conn = conn;
  db = drizzle(conn, { schema });
}

export { db };
