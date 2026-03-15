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

/**
 * Loads and returns the contents of config/projectConfig.json
 * as a plain object. The shape is defined by each project —
 * the framework imposes no type constraints here.
 *
 * @returns  Plain object from projectConfig.json
 * @throws   If the file is missing or contains invalid JSON
 */
export function loadProjectConfig(): Record<string, any> {
  const configPath = path.join(process.cwd(), "config", "projectConfig.json");

  if (!fs.existsSync(configPath)) {
    throw new Error(
      `❌ projectConfig.json not found at ${configPath}\n` +
      `   Create config/projectConfig.json in your project root.`
    );
  }

  const raw = fs.readFileSync(configPath, "utf-8");

  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new Error(
      `❌ projectConfig.json contains invalid JSON at ${configPath}\n${e}`
    );
  }
}
