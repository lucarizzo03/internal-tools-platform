import { registerApp } from "@/lib/platform/registry";
import { query } from "@/lib/platform/db";
import type { Row } from "@/lib/platform/types";

registerApp({
  app: "refunds",
  title: "Refunds",
  source: "refunds.refund_requests",
  orderBy: { key: "created_at", direction: "desc" },
  columns: [
    { key: "customer", label: "Customer" },
    {
      key: "amount",
      label: "Amount",
      render: (v) => `$${Number(v).toFixed(2)}`,
    },
    { key: "reason", label: "Reason" },
    { key: "status", label: "Status" },
  ],
  actions: [
    {
      label: "Approve",
      permission: "refunds.approve",
      handler: async (row: Row) => {
        await query(
          `UPDATE refunds.refund_requests
              SET status = 'approved'
            WHERE id = $1 AND status = 'pending'`,
          [row.id],
        );
      },
    },
    {
      label: "Deny",
      permission: "refunds.approve",
      handler: async (row: Row) => {
        await query(
          `UPDATE refunds.refund_requests
              SET status = 'denied'
            WHERE id = $1 AND status = 'pending'`,
          [row.id],
        );
      },
    },
  ],
});
