import "server-only";
import { Pool } from "pg";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ??
    "postgres://postgres:postgres@localhost:5432/platform",
});

export async function query<T extends Record<string, unknown> = Record<string, unknown>>(
  text: string,
  params?: unknown[],
) {
  return pool.query<T>(text, params);
}
