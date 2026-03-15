import fs from "fs";
import { ApiAuthProvider, AuthStorageConfig } from "../../types/auth";
import { getStoragePath }   from "./storagePath";
import { isAuthStoreValid } from "./validateStore";
import { resolveProvider }  from "./resolveProvider";

/**
 * Manages API token authentication with optional token caching.
 *
 * Flow:
 *   1. If storage disabled → call getToken() directly, no caching
 *   2. If valid cached token exists → return it, skip login call
 *   3. If no valid token → call getToken(), save to file, return token
 *
 * Storage format: { token: "...", savedAt: 1234567890 }
 *
 * @returns JWT token string ready to use in Authorization header
 */
export async function initApiAuthSession(
  request:          any,
  authStorage:      AuthStorageConfig | undefined,
  creds:            { username: string; password: string },
  providerRegistry: Record<string, new (creds: { username: string; password: string }) => ApiAuthProvider>
): Promise<string> {

  const ProviderClass = resolveProvider(authStorage?.provider ?? "default", providerRegistry);
  const authProvider  = new ProviderClass(creds);

  // ── Storage disabled → get token directly ────────────────────
  if (!authStorage?.enabled) {
    console.log("[Framework] API auth storage disabled — performing direct login");
    return authProvider.getToken(request);
  }

  const { validityMinutes, provider } = authStorage;
  const envName     = process.env.TEST_ENV || "default";
  const storagePath = getStoragePath(provider, envName, creds.username);

  // ── Valid cached token exists → return it ────────────────────
  if (isAuthStoreValid(storagePath, validityMinutes)) {
    const saved = JSON.parse(fs.readFileSync(storagePath, "utf-8"));
    console.log(`[Framework] ✅ Using cached API token for: ${creds.username}`);
    return saved.token;
  }

  // ── No valid token → fresh login + save ──────────────────────
  console.log("[Framework] Performing fresh API login...");
  const token = await authProvider.getToken(request);

  fs.writeFileSync(storagePath, JSON.stringify({
    token,
    savedAt: Date.now(),
  }, null, 2));

  console.log(`[Framework] New API token cached: ${storagePath}`);
  return token;
}
