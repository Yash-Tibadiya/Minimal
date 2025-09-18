import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import * as relations from "./relations";
import { config } from "@/config";

declare global {
  // eslint-disable-next-line no-var
  var __dbPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __drizzle: ReturnType<typeof drizzle> | undefined;
}

const connectionString = config.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "Missing env: DATABASE_URL. Add it to an .env file or your environment."
  );
}

const pool =
  global.__dbPool ??
  new Pool({
    connectionString,
    keepAlive: true,
    max: 10,
  });

if (!global.__dbPool) {
  global.__dbPool = pool;
}

// Generated tables and relations are in ./drizzle; pass them for typed queries
const db =
  global.__drizzle ?? drizzle(pool, { schema: { ...schema, ...relations } });

if (!global.__drizzle) {
  global.__drizzle = db;
}

export { pool, db };

export async function ping(): Promise<boolean> {
  const client = await pool.connect();
  try {
    await client.query("select 1");
    return true;
  } finally {
    client.release();
  }
}
