"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getApp } from "./registry";
import { getCurrentUser, setSessionUser, userExists } from "./session";
import { hasPermission } from "./guard";
import { writeAudit } from "./audit";
import type { Row } from "./types";

/**
 * The single entry point for every row action in every app.
 * 1. resolve the app's registered action config
 * 2. check the current user has the action's permission
 * 3. run the app's handler only if allowed
 * 4. write an audit_log entry either way (denials included)
 *
 * Apps never see permission or audit APIs; this is the only place both live.
 */
export async function executeRowAction(
  app: string,
  actionLabel: string,
  row: Row,
  formData: FormData,
): Promise<void> {
  const config = getApp(app);
  const action = config.actions?.find((a) => a.label === actionLabel);
  if (!action) throw new Error(`Unknown action: ${app}/${actionLabel}`);

  const user = await getCurrentUser();
  const target = `${config.source}#${row.id}`;
  const args: Record<string, string> = {};
  if (action.input) {
    args[action.input.name] = String(formData.get(action.input.name) ?? "");
  }

  const allowed = user !== null && (await hasPermission(user.id, action.permission));

  let handlerError: string | undefined;
  if (allowed && user) {
    try {
      await action.handler(row, formData);
    } catch (e) {
      handlerError = e instanceof Error ? e.message : String(e);
    }
  }

  await writeAudit({
    userId: user?.id ?? null,
    app: config.app,
    action: action.label,
    target,
    allowed,
    permission: action.permission,
    args: Object.keys(args).length ? args : undefined,
    error: handlerError,
  });

  revalidatePath(`/${app}`);
  if (handlerError) throw new Error(handlerError);
}

/** Session switcher: pick a seeded user. No password. */
export async function switchUser(formData: FormData): Promise<void> {
  const id = Number(formData.get("user_id"));
  if (Number.isInteger(id) && (await userExists(id))) {
    await setSessionUser(id);
  }
  redirect("/");
}
