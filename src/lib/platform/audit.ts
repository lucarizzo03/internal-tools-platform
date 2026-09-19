import "server-only";
import { query } from "./db";

/**
 * The only place that can write audit_log. Not exported to app code —
 * only the platform's executeRowAction calls it.
 */
export async function writeAudit(entry: {
  userId: number | null;
  app: string;
  action: string;
  target: string;
  allowed: boolean;
  permission: string;
  args?: Record<string, string>;
  error?: string;
}): Promise<void> {
  const { userId, app, action, target, ...rest } = entry;
  await query(
    `INSERT INTO core.audit_log (user_id, app, action, target, detail)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, app, action, target, JSON.stringify(rest)],
  );
}
