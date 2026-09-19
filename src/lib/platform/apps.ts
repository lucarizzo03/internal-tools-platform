import "server-only";
import { listApps } from "./registry";
import { userPermissionKeys } from "./guard";
import type { AppConfig } from "./types";
import type { AppUser } from "./session";

/**
 * Apps a user may see: every app they hold at least one permission for.
 * Apps with no actions (e.g. audit) are visible to any logged-in user.
 */
export async function visibleAppsFor(user: AppUser | null): Promise<AppConfig[]> {
  if (!user) return [];
  const keys = await userPermissionKeys(user.id);
  return listApps().filter(
    (c) =>
      !c.actions ||
      c.actions.length === 0 ||
      c.actions.some((a) => keys.has(a.permission)),
  );
}
