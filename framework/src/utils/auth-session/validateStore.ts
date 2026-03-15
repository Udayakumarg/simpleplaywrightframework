import fs from "fs";

/**
 * Checks if a stored auth file is valid and not expired.
 *
 * Supports two storage formats:
 *
 * 1. UI / cookie-based (Playwright storageState):
 *    { cookies: [...], origins: [...] }
 *    Valid if cookies or origins are non-empty and file age < validityMinutes
 *
 * 2. API / token-based:
 *    { token: "...", savedAt: 1234567890 }
 *    Valid if token exists and (now - savedAt) < validityMinutes
 */
export function isAuthStoreValid(
  storagePath:    string,
  validityMinutes: number
): boolean {
  if (!fs.existsSync(storagePath)) return false;

  const raw = fs.readFileSync(storagePath, "utf-8").trim();
  if (!raw) return false;

  try {
    const state = JSON.parse(raw);

    // ── API token format ──────────────────────────────────────
    if (state.token && state.savedAt) {
      const ageMinutes = (Date.now() - state.savedAt) / 60000;
      return ageMinutes < validityMinutes;
    }

    // ── UI / Playwright storageState format ───────────────────
    if (state.cookies !== undefined || state.origins !== undefined) {
      const hasContent = (state.cookies?.length > 0) || (state.origins?.length > 0);
      const stats      = fs.statSync(storagePath);
      const ageMinutes = (Date.now() - stats.mtimeMs) / 60000;
      return hasContent && ageMinutes < validityMinutes;
    }

    return false;
  } catch {
    return false;
  }
}
