import { notFound } from "next/navigation";
import { listApps, getApp } from "@/lib/platform/registry";
import { getCurrentUser } from "@/lib/platform/session";
import { userPermissionKeys } from "@/lib/platform/guard";
import { DataTable } from "@/components/DataTable";

/**
 * Generic app route: /<app>. Every app is a registered config rendered
 * by DataTable. Viewing requires being logged in and holding at least
 * one of the app's action permissions (same rule as the nav filter);
 * actionless apps (e.g. audit) are viewable by any logged-in user.
 */
export default async function AppPage({
  params,
}: {
  params: Promise<{ app: string }>;
}) {
  const { app } = await params;
  if (!listApps().some((a) => a.app === app)) notFound();

  const config = getApp(app);
  const user = await getCurrentUser();
  if (!user) notFound();

  if (config.actions && config.actions.length > 0) {
    const keys = await userPermissionKeys(user.id);
    if (!config.actions.some((a) => keys.has(a.permission))) notFound();
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">
        {config.title}
      </h1>
      <div className="rounded-lg border border-slate-200 bg-white">
        <DataTable app={app} />
      </div>
    </div>
  );
}
