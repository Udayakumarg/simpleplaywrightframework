import fs from "fs";
import path from "path";

const SAFE = /[^A-Za-z0-9._-]/g;

/**
 * storage/{provider}-{env}-{username}-auth.json (creates dir on demand).
 * Username is sanitized so emails / domain users don't blow up the filename.
 * Override the directory via FRAMEWORK_STORAGE_DIR.
 */
export function getStoragePath(provider: string, envName: string, username: string): string {
  const dir = path.resolve(process.env.FRAMEWORK_STORAGE_DIR || "storage");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const safe = username.replace(SAFE, "_");
  return path.join(dir, `${provider}-${envName}-${safe}-auth.json`);
}
