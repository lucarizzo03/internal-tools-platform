import "server-only";
import { query } from "./db";

/**
 * Every permission check in the platform funnels through this module.
 * Apps never check permissions themselves.
 */
export async function userPermissionKeys(userId: number): Promise<Set<string>> {
  const { rows } = await query<{ key: string }>(
    `SELECT DISTINCT p.key
       FROM core.user_roles ur
       JOIN core.role_permissions rp ON rp.role_id = ur.role_id
       JOIN core.permissions p ON p.id = rp.permission_id
      WHERE ur.user_id = $1`,
    [userId],
  );
  return new Set(rows.map((r) => r.key));
}

export async function hasPermission(
  userId: number,
  permission: string,
): Promise<boolean> {
  return (await userPermissionKeys(userId)).has(permission);
}
