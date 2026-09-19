import "server-only";
import { cookies } from "next/headers";
import { query } from "./db";

const SESSION_COOKIE = "itp_user_id";

export type AppUser = {
  id: number;
  name: string;
  email: string;
};

export async function getCurrentUser(): Promise<AppUser | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const id = Number(raw);
  if (!Number.isInteger(id)) return null;
  const { rows } = await query<AppUser>(
    "SELECT id, name, email FROM core.users WHERE id = $1",
    [id],
  );
  return rows[0] ?? null;
}

export async function listUsers(): Promise<Pick<AppUser, "id" | "name">[]> {
  const { rows } = await query<Pick<AppUser, "id" | "name">>(
    "SELECT id, name FROM core.users ORDER BY name",
  );
  return rows;
}

/** Used by the switchUser server action. */
export async function setSessionUser(userId: number): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, String(userId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

export async function userExists(userId: number): Promise<boolean> {
  const { rows } = await query<{ id: number }>(
    "SELECT id FROM core.users WHERE id = $1",
    [userId],
  );
  return rows.length > 0;
}
