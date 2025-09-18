import { config } from '@/config';
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const url = config.DATABASE_URL;
if (!url) {
  throw new Error('Missing env: DATABASE_URL. Add it to an .env file or your environment.');
}

export default defineConfig({
  dialect: 'postgresql',
  // Where drizzle-kit pull will write your generated schema
  schema: './src/db/schema.ts',
  // Output folder for pull (schema.ts, relations.ts, meta) and migrations
  out: './src/db',
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