import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// Global variable to persist client across hot reloads in development
const globalForDb = global as unknown as {
  client: postgres.Sql | undefined;
};

export const client = globalForDb.client ?? postgres(connectionString, { 
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

if (process.env.NODE_ENV !== 'production') globalForDb.client = client;

export const db = drizzle(client, { schema });

export type Database = typeof db;
export type { schema };