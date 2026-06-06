import fs from "fs";

/**
 * Checks whether a stored auth file is present and not expired.
 *
 * Recognised formats:
 *   { token,  savedAt }      → API token cache
 *   { custom, savedAt }      → provider-managed custom state
 *   { cookies, origins, ... }→ Playwright storageState (uses file mtime)
 */
export function isAuthStoreValid(storagePath: string, validityMinutes: number): boolean {
  if (!fs.existsSync(storagePath)) return false;

  const raw = fs.readFileSync(storagePath, "utf-8").trim();
  if (!raw) return false;

  let state: any;
  try { state = JSON.parse(raw); } catch { return false; }

  const ageMs = (savedAt: number) => Date.now() - savedAt;
  const isFresh = (ms: number) => ms / 60_000 < validityMinutes;

  if (typeof state.savedAt === "number" && (state.token || state.custom !== undefined)) {
    return isFresh(ageMs(state.savedAt));
  }

  if (state.cookies !== undefined || state.origins !== undefined) {
    const hasContent = (state.cookies?.length > 0) || (state.origins?.length > 0);
    return hasContent && isFresh(ageMs(fs.statSync(storagePath).mtimeMs));
  }

  return false;
}
