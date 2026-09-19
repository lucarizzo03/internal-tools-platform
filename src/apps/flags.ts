import { registerApp } from "@/lib/platform/registry";
import { query } from "@/lib/platform/db";
import type { Row } from "@/lib/platform/types";

registerApp({
  app: "flags",
  title: "Feature Flags",
  source: "flags.feature_flags",
  orderBy: { key: "id" },
  columns: [
    { key: "name", label: "Name", deemphasizeRepeats: true },
    { key: "environment", label: "Environment" },
    {
      key: "rollout_percent",
      label: "Rollout",
      render: (v) => `${v}%`,
    },
    {
      key: "enabled",
      label: "Status",
      render: (v) => (v ? "Enabled" : "Disabled"),
    },
  ],
  actions: [
    {
      label: "Enable",
      permission: "flags.write",
      when: (row) => row.enabled === false,
      handler: async (row: Row) => {
        await query(
          `UPDATE flags.feature_flags
              SET enabled = true, updated_at = now()
            WHERE id = $1`,
          [row.id],
        );
      },
    },
    {
      label: "Disable",
      permission: "flags.write",
      when: (row) => row.enabled === true,
      handler: async (row: Row) => {
        await query(
          `UPDATE flags.feature_flags
              SET enabled = false, updated_at = now()
            WHERE id = $1`,
          [row.id],
        );
      },
    },
    {
      label: "Set Rollout",
      permission: "flags.write",
      input: { name: "percent", type: "number", placeholder: "0-100" },
      handler: async (row: Row, formData: FormData) => {
        const percent = Number(formData.get("percent"));
        if (!Number.isInteger(percent) || percent < 0 || percent > 100) return;
        await query(
          `UPDATE flags.feature_flags
              SET rollout_percent = $1, updated_at = now()
            WHERE id = $2`,
          [percent, row.id],
        );
      },
    },
  ],
});
