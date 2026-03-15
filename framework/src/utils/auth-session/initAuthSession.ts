import fs   from "fs";
import { Page } from "@playwright/test";
import { AuthProvider, AuthStorageConfig } from "../../types/auth";
import { getStoragePath }   from "./storagePath";
import { isAuthStoreValid } from "./validateStore";
import { resolveProvider }  from "./resolveProvider";
import { restoreSession }   from "./restoreSession";

/**
 * Manages UI authentication with optional session storage.
 *
 * Flow:
 *   1. If storage disabled → login directly, no caching
 *   2. If valid stored session exists → restore it, skip login
 *   3. If no valid session → perform fresh login, save session
 *
 * Supports both localStorage token apps (Nexus) and cookie-based apps.
 */
export async function initAuthSession(
  page:             Page,
  authStorage:      AuthStorageConfig | undefined,
  creds:            { username: string; password: string },
  providerRegistry: Record<string, new (creds: { username: string; password: string }) => AuthProvider>
): Promise<void> {

  const ProviderClass  = resolveProvider(authStorage?.provider ?? "default", providerRegistry);
  const authProvider   = new ProviderClass(creds);

  // ── Storage disabled → login directly ────────────────────────
  if (!authStorage?.enabled) {
    console.log("[Framework] Auth storage disabled — performing direct login");
    await authProvider.login(page);
    return;
  }

  const { validityMinutes, provider } = authStorage;
  const envName     = process.env.TEST_ENV || "default";
  const storagePath = getStoragePath(provider, envName, creds.username);

  // ── Valid session exists → restore it ────────────────────────
  if (isAuthStoreValid(storagePath, validityMinutes)) {
    console.log(`[Framework] Restoring valid auth store: ${storagePath}`);
    await restoreSession(page, storagePath);
    console.log(`[Framework] ✅ Session restored from storage`);
    return;
  }

  // ── No valid session → fresh login + save ────────────────────
  console.log("[Framework] Performing fresh login...");
  await authProvider.login(page);

  // Save token + user from localStorage if present (token-based apps)
  const saved = await page.evaluate(() => ({
    token: localStorage.getItem("token"),
    user:  localStorage.getItem("user"),
  }));

  if (saved.token) {
    // Token-based app — save token + user
    fs.writeFileSync(storagePath, JSON.stringify({
      token:   saved.token,
      user:    saved.user ? JSON.parse(saved.user) : null,
      savedAt: Date.now(),
    }, null, 2));
  } else {
    // Cookie-based app — save full Playwright storageState
    await page.context().storageState({ path: storagePath });
  }

  console.log(`[Framework] New auth store created: ${storagePath}`);
}
