import Link from "next/link";
import type { ReactNode } from "react";
import { getCurrentUser, listUsers } from "@/lib/platform/session";
import { visibleAppsFor } from "@/lib/platform/apps";
import { UserSwitcher } from "./UserSwitcher";

export async function AppShell({ children }: { children: ReactNode }) {
  const [user, users] = await Promise.all([getCurrentUser(), listUsers()]);
  const apps = await visibleAppsFor(user);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-slate-100">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
          <Link href="/" className="font-semibold tracking-tight">
            Internal Tools
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            {apps.map((a) => (
              <Link
                key={a.app}
                href={`/${a.app}`}
                className="text-slate-300 hover:text-white"
              >
                {a.title}
              </Link>
            ))}
          </nav>
          <div className="ml-auto">
            <UserSwitcher users={users} currentId={user?.id ?? null} />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
