import fs from "fs";

export function isAuthStoreValid(storagePath: string, validityMinutes: number): boolean {
  if (!fs.existsSync(storagePath)) return false;
  const raw = fs.readFileSync(storagePath, "utf-8").trim();
  if (!raw) return false;

  try {
    const state = JSON.parse(raw);
    const stats = fs.statSync(storagePath);
    const ageMinutes = (Date.now() - stats.mtimeMs) / 60000;
    return (state.cookies?.length > 0 || state.origins?.length > 0) && ageMinutes < validityMinutes;
  } catch {
    return false;
  }
}
