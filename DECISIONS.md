# Decisions

Decisions made while building this platform, per the spec's decision
protocol. Entries marked (user-chosen) were answered directly; the rest
were picked by me and can be revisited.

## 2026-09-19 — Phase 1 (base layer)

1. **Data layer: raw `pg`, no ORM** (user-chosen). The schema lives only
   in `db/init/*.sql`, run by Postgres's `/docker-entrypoint-initdb.d` on
   first boot; an ORM would duplicate the schema in TypeScript for zero
   benefit at this size.
2. **User switcher: dropdown in the nav** (user-chosen). Minimal; one
   click to switch between the three seeded users.
3. **Next.js App Router + Server Actions.** Each row action is a
   `<form action={...}>` submission to the platform's single server
   action, so the table needs no client-side JS and the
   check → run → audit wrapper cannot be bypassed from the browser.
4. **App configs are registered server-side via `registerApp()`**;
   `<DataTable app="flags" />` looks the config up in a module-level
   registry. Handler functions therefore never serialize across the
   client boundary — the submitted form carries only
   `(app, action label, row)`.
5. **`source` is a `"schema.table"` (or view) string; the platform runs
   the `SELECT *` itself.** Apps declare what to render rather than
   fetching it. `source`/`orderBy` are validated against identifier
   regexes before interpolation.
6. **Actions a user lacks permission for render as disabled buttons**
   (user-chosen; initial pick was hidden). The button is visible with a
   `Requires <permission>` tooltip but cannot be submitted from the UI.
   Enforcement is server-side regardless, so a forged request still
   produces a denied audit entry.
7. **Viewing an app page requires ≥1 of that app's declared
   permissions** — same rule as the nav filter, extended to direct URL
   access. Apps with no actions (audit) are viewable by any logged-in
   user. Easy to relax if reads should be open.
8. **allowed/denied lives in `audit_log.detail`** (jsonb), as
   `{allowed: bool, permission, args}` — the spec fixed the column list.
9. **`target` = `<source>#<row.id>`**, e.g. `flags.feature_flags#17`.
10. **`app` is overloaded deliberately**: route segment (`/flags`), nav
    label key, and `audit_log.app`. One string, three uses.
11. **Session = `itp_user_id` httpOnly cookie; no default user** — first
    visit asks you to pick, so the permission model is visible from the
    start. No passwords per spec.
12. **Seeded emails use `@example.com`** (RFC-reserved domain).
13. **Ports: app on 3000; Postgres stays on the internal compose network**
    (no host port published — avoids colliding with a local Postgres on
    5432).
14. **Postgres 17-alpine in compose; app Dockerfile on node:24-alpine**
    with `output: "standalone"` for a minimal runner image.
15. **`core.v_audit_log` view** joins users and extracts `allowed` from
    `detail`, so the Phase 4 audit page is itself a pure DataTable config.
16. **`docker compose up` needs no `.env`** — compose carries local
    defaults; `.env.example` exists for running the app outside compose.
17. **Handler failures are audited too.** `executeRowAction` writes the
    audit row even if the app's handler throws (`detail.error`), so a
    crashed write still leaves a trail.

## Phase notes

- Flags: `UNIQUE(name, environment)`; Set Rollout validates 0–100 inside
  its handler (`action.input` declares the field, the handler owns the
  write).
- Refunds: Approve/Deny only affect `status='pending'` rows — a decided
  refund can't be re-decided by clicking again.
- Buttons render disabled for missing permissions (per user veto of the
  hide option) and the form submits only through `executeRowAction`.
