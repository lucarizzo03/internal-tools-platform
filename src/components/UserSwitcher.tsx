"use client";

import { switchUser } from "@/lib/platform/actions";

export function UserSwitcher({
  users,
  currentId,
}: {
  users: { id: number; name: string }[];
  currentId: number | null;
}) {
  return (
    <form action={switchUser} className="flex items-center gap-2">
      <label htmlFor="user_id" className="text-xs text-slate-400">
        User
      </label>
      <select
        id="user_id"
        name="user_id"
        defaultValue={currentId ?? ""}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="rounded border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-slate-100"
      >
        <option value="" disabled>
          Select user…
        </option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>
    </form>
  );
}
