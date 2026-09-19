import { registerApp } from "@/lib/platform/registry";

registerApp({
  app: "audit",
  title: "Audit Log",
  source: "core.v_audit_log",
  orderBy: { key: "created_at", direction: "desc" },
  columns: [
    {
      key: "user_name",
      label: "User",
      render: (v) => (v == null ? "—" : String(v)),
    },
    { key: "app", label: "App" },
    { key: "action", label: "Action" },
    { key: "target", label: "Target" },
    {
      key: "allowed",
      label: "Result",
      render: (v) => (v ? "allowed" : "denied"),
    },
    {
      key: "created_at",
      label: "Time",
      render: (v) => (v instanceof Date ? v.toLocaleString() : String(v)),
    },
  ],
});
