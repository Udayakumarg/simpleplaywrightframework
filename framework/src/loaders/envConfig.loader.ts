import fs from "fs";
import path from "path";
import type { EnvConfig } from "../types/env";
import { resolveEnv } from "../utils/env";
import { interpolate, loadDotenv } from "../utils/dotenv";

let cached: EnvConfig | null = null;

export function loadConfig(force = false): EnvConfig {
  if (cached && !force) return cached;

  loadDotenv();

  const configPath = path.join(process.cwd(), "config", "environments.json");
  if (!fs.existsSync(configPath)) {
    throw new Error(`environments.json not found at ${configPath}`);
  }

  let raw: string;
  let parsed: any;
  try {
    raw = fs.readFileSync(configPath, "utf-8");
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new Error(`Failed to read/parse ${configPath}: ${(e as Error).message}`);
  }

  const envName = resolveEnv();
  const defaults = parsed.defaults || {};
  const envSlice = parsed[envName];

  if (!envSlice) {
    throw new Error(
      `Environment '${envName}' not defined in environments.json. Available: ${Object.keys(parsed).filter(k => k !== "defaults").join(", ")}`
    );
  }

  const merged = interpolate<EnvConfig>({ ...defaults, ...envSlice });

  if (!merged.baseUrl) {
    throw new Error(`Environment '${envName}' missing required baseUrl`);
  }

  cached = merged;
  return merged;
}

