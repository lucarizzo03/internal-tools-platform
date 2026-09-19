import type { ReactNode } from "react";
import { getApp } from "@/lib/platform/registry";
import { getCurrentUser } from "@/lib/platform/session";
import { userPermissionKeys } from "@/lib/platform/guard";
import { executeRowAction } from "@/lib/platform/actions";
import { query } from "@/lib/platform/db";
import type { AppConfig, Row } from "@/lib/platform/types";

const IDENT = /^[a-z_][a-z0-9_]*$/;
const SOURCE = /^[a-z_][a-z0-9_]*\.[a-z_][a-z0-9_]*$/;

function defaultRender(value: unknown): ReactNode {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

async function loadRows(config: AppConfig): Promise<Row[]> {
  if (!SOURCE.test(config.source)) {
    throw new Error(
      `Invalid source "${config.source}" (expected schema.table)`,
    );
  }
  let sql = `SELECT * FROM ${config.source}`;
  if (config.orderBy) {
    if (!IDENT.test(config.orderBy.key)) {
      throw new Error(`Invalid orderBy key "${config.orderBy.key}"`);
    }
    sql += ` ORDER BY ${config.orderBy.key} ${config.orderBy.direction === "desc" ? "DESC" : "ASC"}`;
  }
  const { rows } = await query<Row>(sql);
  return rows;
}

/**
 * The platform's only table. An app is a config object registered via
 * registerApp(); this component renders it: columns, rows, and one form
 * per row action (button disabled when the user lacks its permission).
 */
export async function DataTable({ app }: { app: string }) {
  const config = getApp(app);
  const [user, rows] = await Promise.all([getCurrentUser(), loadRows(config)]);
  const perms = user ? await userPermissionKeys(user.id) : new Set<string>();
  const actions = config.actions ?? [];
  const showActions = actions.length > 0;

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-slate-200 text-left">
          {config.columns.map((c) => (
            <th key={c.key} className="px-4 py-2 font-medium text-slate-500">
              {c.label}
            </th>
          ))}
          {showActions && (
            <th className="px-4 py-2 font-medium text-slate-500">Actions</th>
          )}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={String(row.id ?? i)} className="border-b border-slate-100">
            {config.columns.map((c) => {
              const repeat =
                c.deemphasizeRepeats &&
                i > 0 &&
                rows[i - 1][c.key] === row[c.key];
              return (
                <td
                  key={c.key}
                  className={`px-4 py-2 ${repeat ? "text-slate-300" : "text-slate-800"}`}
                >
                  {c.render
                    ? c.render(row[c.key], row)
                    : defaultRender(row[c.key])}
                </td>
              );
            })}
            {showActions && (
              <td className="px-4 py-2">
                <div className="flex items-center gap-2">
                  {actions
                    .filter((a) => !a.when || a.when(row))
                    .map((a) => {
                      const allowed = perms.has(a.permission);
                      return (
                        <form
                          key={a.label}
                          action={executeRowAction.bind(
                            null,
                            app,
                            a.label,
                            row,
                          )}
                          className="flex items-center gap-1"
                        >
                          {a.input && (
                            <input
                              name={a.input.name}
                              type={a.input.type}
                              placeholder={a.input.placeholder}
                              required
                              disabled={!allowed}
                              className="w-20 rounded border border-slate-300 px-2 py-1 text-xs disabled:bg-slate-100"
                            />
                          )}
                          <button
                            type="submit"
                            disabled={!allowed}
                            title={
                              allowed ? undefined : `Requires ${a.permission}`
                            }
                            className="rounded bg-slate-800 px-3 py-1 text-xs font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                          >
                            {a.label}
                          </button>
                        </form>
                      );
                    })}
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
