# internal-tools-platform

A base platform layer — users, roles, permissions, an audit log, and a shared
data-table component — with small internal apps built on top of it. The point of
the build is that the second app costs almost nothing because the base layer
already exists.

Stack: Next.js + TypeScript, Postgres, Tailwind. Single app, single Postgres
instance.

## Quickstart

```sh
git clone https://github.com/lucarizzo03/internal-tools-platform.git
cd internal-tools-platform
docker compose up
```

Open http://localhost:3000. Postgres loads the schema and seed data
automatically on first boot from `db/init/`; no `.env` is needed for the
defaults.

## Users

Three seeded users, switchable from the dropdown in the nav. No passwords.

- **flag-ops** — has `flags.write`: can Enable / Disable / Set Rollout on
  feature flags at `/flags`. Nothing else.
- **refund-ops** — has `refunds.approve`: can Approve / Deny refund requests at
  `/refunds`. Nothing else.
- **admin** — has both permissions.

`/audit` (the audit log of every action attempt, allowed or denied) is visible
to any signed-in user.

## Adding a new app

An app is a config object registered with the platform — one file plus one
import. Example, the flags app (`src/apps/flags.ts`):

```ts
import { registerApp } from "@/lib/platform/registry";
import { query } from "@/lib/platform/db";
import type { Row } from "@/lib/platform/types";

registerApp({
  app: "flags",                        // becomes /flags and audit_log.app
  title: "Feature Flags",
  source: "flags.feature_flags",       // the platform runs SELECT * itself
  orderBy: { key: "id" },
  columns: [
    { key: "name", label: "Name" },
    { key: "environment", label: "Environment" },
    { key: "rollout_percent", label: "Rollout", render: (v) => `${v}%` },
    { key: "enabled", label: "Status", render: (v) => (v ? "Enabled" : "Disabled") },
  ],
  actions: [
    {
      label: "Enable",
      permission: "flags.write",
      handler: async (row: Row) => {
        await query(
          "UPDATE flags.feature_flags SET enabled = true, updated_at = now() WHERE id = $1",
          [row.id],
        );
      },
    },
    // ... Disable, Set Rollout
  ],
});
```

Then add `import "./flags";` to `src/apps/index.ts`. The route, the nav entry,
the permission gating, and the audit logging all come from the config. Row
actions only ever run inside the platform's `executeRowAction`, which checks the
declared permission, runs the handler if allowed, and writes an `audit_log` row
either way — apps can't reach the permission or audit functions themselves.

New tables/seeds go in a numbered file in `db/init/` (e.g. `04-myapp.sql`).

## Deliberately not built

- Real SSO or password auth (the seeded-user picker stands in)
- Hosting, CI, deployment
- Detail views (table rows only)
- Search or filtering
- Multi-step approval flows
- Any production hardening
