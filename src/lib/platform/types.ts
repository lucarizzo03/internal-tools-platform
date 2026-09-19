import type React from "react";

export type Row = Record<string, unknown>;

export interface Column {
  /** Field name in a row from `source`. */
  key: string;
  /** Column header text. */
  label: string;
  /** Optional formatter; defaults to a sane stringification. */
  render?: (value: unknown, row: Row) => React.ReactNode;
  /** Dim the cell when its value repeats the row directly above. */
  deemphasizeRepeats?: boolean;
}

export interface ActionInput {
  name: string;
  type: "text" | "number";
  placeholder?: string;
}

export interface RowAction {
  /** Button label; also stored as audit_log.action. */
  label: string;
  /** Permission key required to run this action, e.g. "flags.write". */
  permission: string;
  /** Optional predicate: the button renders only for rows it accepts. */
  when?: (row: Row) => boolean;
  /** Optional inline input rendered next to the button (e.g. rollout %). */
  input?: ActionInput;
  /**
   * The app's own write logic. Only ever invoked by the platform's
   * executeRowAction, after the permission check. Receives the clicked
   * row and the form data (declared inputs only).
   */
  handler: (row: Row, formData: FormData) => Promise<void>;
}

export interface AppConfig {
  /**
   * Unique app key. Conventions: it is the route segment (`/${app}`),
   * the nav label source, and the value written to audit_log.app.
   */
  app: string;
  /** Display name used in nav and on the app's page. */
  title: string;
  /** "schema.table" (or view) the platform SELECTs from. */
  source: string;
  orderBy?: { key: string; direction?: "asc" | "desc" };
  columns: Column[];
  actions?: RowAction[];
}
