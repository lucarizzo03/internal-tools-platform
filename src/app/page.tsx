import Link from "next/link";
import { getCurrentUser } from "@/lib/platform/session";
import { visibleAppsFor } from "@/lib/platform/apps";

export default async function Home() {
  const user = await getCurrentUser();
  const apps = await visibleAppsFor(user);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Internal Tools</h1>
      {!user ? (
        <p className="mt-4 text-slate-600">
          Pick a user from the dropdown above to sign in.
        </p>
      ) : apps.length === 0 ? (
        <p className="mt-4 text-slate-600">
          Signed in as <strong>{user.name}</strong> — no apps available.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {apps.map((a) => (
            <Link
              key={a.app}
              href={`/${a.app}`}
              className="rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-400"
            >
              <div className="font-medium text-slate-900">{a.title}</div>
              <div className="mt-1 text-xs text-slate-500">/{a.app}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
