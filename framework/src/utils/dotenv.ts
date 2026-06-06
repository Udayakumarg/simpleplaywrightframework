import fs from "fs";
import path from "path";
import { resolveEnv } from "./env";

const LINE = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/;

function parse(raw: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) continue;
    const m = LINE.exec(line);
    if (!m) continue;
    let val = m[2];
    if (
      (val.startsWith("\"") && val.endsWith("\"")) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[m[1]] = val;
  }
  return out;
}

function loadFile(filePath: string): void {
  if (!fs.existsSync(filePath)) return;
  const raw = fs.readFileSync(filePath, "utf-8");
  for (const [k, v] of Object.entries(parse(raw))) {
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

/**
 * Loads `.env` then `.env.<TEST_ENV>` from the consumer cwd.
 * Existing process.env values win — this is non-destructive.
 * Call once early (e.g. top of playwright.config.ts).
 */
export function loadDotenv(cwd: string = process.cwd()): void {
  loadFile(path.join(cwd, ".env"));
  loadFile(path.join(cwd, `.env.${resolveEnv()}`));
}

/**
 * Replaces ${VAR} or $VAR placeholders inside any string in `value`
 * with values from process.env. Recurses into arrays and plain objects.
 * Unresolved placeholders throw — fail loud, not silent.
 */
export function interpolate<T>(value: T): T {
  if (typeof value === "string") {
    return value.replace(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}|\$([A-Za-z_][A-Za-z0-9_]*)/g, (_m, a, b) => {
      const key = a || b;
      const v = process.env[key];
      if (v === undefined) {
        throw new Error(`Missing environment variable: ${key}`);
      }
      return v;
    }) as unknown as T;
  }
  if (Array.isArray(value)) return value.map(interpolate) as unknown as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = interpolate(v);
    }
    return out as unknown as T;
  }
  return value;
}
