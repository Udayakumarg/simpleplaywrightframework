// ════════════════════════════════════════════════════════════════
// framework/src/loaders/projectConfig.loader.ts
//
// Loads projectConfig.json from the consuming project's
// config/ directory. Follows the exact same pattern as
// envConfig.loader.ts — flat JSON, no env nesting.
//
// projectConfig.json is for project-wide constants that are
// not environment-specific (threshold, schema paths, etc).
// Anything env-specific belongs in environments.json instead.
// ════════════════════════════════════════════════════════════════

import fs   from "fs";
import path from "path";
import { interpolate } from "../utils/dotenv";

let cached: Record<string, any> | null = null;

/**
 * Loads `config/projectConfig.json` from the consumer cwd.
 * `${VAR}` placeholders are resolved against process.env.
 * Returns a frozen object — cached after first read.
 */
export function loadProjectConfig<T extends Record<string, any> = Record<string, any>>(
  force = false
): T {
  if (cached && !force) return cached as T;

  const configPath = path.join(process.cwd(), "config", "projectConfig.json");

  if (!fs.existsSync(configPath)) {
    throw new Error(
      `projectConfig.json not found at ${configPath}\n  create config/projectConfig.json in your project root.`
    );
  }

  let parsed: any;
  try {
    parsed = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  } catch (e) {
    throw new Error(`projectConfig.json invalid JSON at ${configPath}: ${(e as Error).message}`);
  }

  cached = interpolate(parsed);
  return cached as T;
}

