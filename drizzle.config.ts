import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error('Missing env: DATABASE_URL. Add it to an .env file or your environment.');
}

export default defineConfig({
  dialect: 'postgresql',
  // Where drizzle-kit pull will write your generated schema
  schema: './src/db/schema.ts',
  // Migrations/output folder (used by other drizzle-kit commands)
  out: './drizzle',
  dbCredentials: {
    url,
    // Some managed Postgres require SSL. If not needed, set to false.
    ssl: 'require',
  },
  // Pull only the public schema (adjust if you use others)
  schemaFilter: ['public'],
  // Reduce CLI noise
  verbose: false,
});