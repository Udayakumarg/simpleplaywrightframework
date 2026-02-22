import fs from "fs";
import path from "path";

export function getStoragePath(provider: string, envName: string, username: string): string {
  const storageDir = path.resolve("storage");
  if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });
  return path.join(storageDir, `${provider}-${envName}-${username}-auth.json`);
}
