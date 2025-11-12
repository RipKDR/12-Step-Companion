// Load environment variables FIRST before checking DATABASE_URL
import "./env";
import * as schema from "@shared/schema";

// Support both local PostgreSQL and Neon serverless
const isNeonDatabase = (url: string): boolean => {
  return url.includes('neon.tech') || url.includes('neon') || (!url.includes('localhost') && !url.includes('127.0.0.1'));
};

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const dbUrl = process.env.DATABASE_URL;

// Initialize database connection based on URL
async function initDb() {
  if (isNeonDatabase(dbUrl)) {
    // Neon serverless connection
    const { Pool, neonConfig } = await import('@neondatabase/serverless');
    const { drizzle } = await import('drizzle-orm/neon-serverless');
    const ws = await import("ws");
    
    neonConfig.webSocketConstructor = ws.default;
    const pool = new Pool({ connectionString: dbUrl });
    const db = drizzle({ client: pool, schema });
    return { db, pool };
  } else {
    // Local PostgreSQL connection
    const pg = await import('pg');
    const { drizzle } = await import('drizzle-orm/node-postgres');
    
    const pool = new pg.Pool({ connectionString: dbUrl });
    const db = drizzle({ client: pool, schema });
    return { db, pool };
  }
}

// Initialize and export
const { db, pool } = await initDb();
export { db, pool };
