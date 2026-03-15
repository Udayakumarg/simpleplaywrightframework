import fs   from "fs";
import path from "path";

/**
 * Builds the file path for storing auth state.
 * Creates the storage directory if it doesn't exist.
 *
 * Format: storage/{provider}-{env}-{username}-auth.json
 */
export function getStoragePath(
  provider: string,
  envName:  string,
  username: string
): string {
  const storageDir = path.resolve("storage");
  if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });
  return path.join(storageDir, `${provider}-${envName}-${username}-auth.json`);
}
