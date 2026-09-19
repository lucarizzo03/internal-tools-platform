import "server-only";
import type { AppConfig } from "./types";

/**
 * Server-side registry of app configs. Handler functions never cross
 * the client boundary — forms carry only (app, action label, row) and
 * the platform resolves the config here.
 */
const registry = new Map<string, AppConfig>();

export function registerApp(config: AppConfig): void {
  registry.set(config.app, config);
}

export function getApp(app: string): AppConfig {
  const config = registry.get(app);
  if (!config) throw new Error(`App "${app}" is not registered`);
  return config;
}

export function listApps(): AppConfig[] {
  return [...registry.values()];
}
