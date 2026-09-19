import type { Metadata } from "next";
import "@/apps";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Internal Tools",
  description: "Internal tools platform",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
