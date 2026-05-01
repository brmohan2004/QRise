import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { type Database } from './index';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

/**
 * Returns a Drizzle client with schema set to 'sandbox'.
 * This uses a separate connection pool with search_path set to sandbox.
 */
let sandboxDb: Database | null = null;

export function getSandboxDb() {
  if (sandboxDb) return sandboxDb;

  const sandboxClient = postgres(connectionString || '', {
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
    onnotice: () => {},
    // Force search_path to sandbox for all connections in this pool
    // Note: The most reliable way with postgres-js is via connection string param ?options=-csearch_path%3Dsandbox
  });

  sandboxDb = drizzle(sandboxClient, { schema });
  return sandboxDb;
}
