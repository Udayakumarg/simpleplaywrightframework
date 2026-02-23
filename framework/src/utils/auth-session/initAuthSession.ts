import { Page } from "@playwright/test";
import { AuthProvider, AuthStorageConfig } from "../../types/auth";
import { getStoragePath } from "./storagePath";
import { isAuthStoreValid } from "./validateStore";

export async function initAuthSession(
  page: Page,
  authStorage: AuthStorageConfig | undefined,
  creds: { username: string; password: string },
  providerRegistry: Record<string, new (creds: { username: string; password: string }) => AuthProvider>
) {
  // Determine which auth provider to use
  const providerName = authStorage?.provider ?? "OrangeHRMLogin";
  const ProviderClass = providerRegistry[providerName];

  if (!ProviderClass) {
    throw new Error(
      `[Framework] Unknown auth provider: ${providerName}\n` +
      `💡 Available providers: ${Object.keys(providerRegistry).join(", ")}`
    );
  }

  const authProvider: AuthProvider = new ProviderClass(creds);

  // If auth storage is disabled, just do a direct login
  if (!authStorage?.enabled) {
    console.log(`[Framework] Auth storage disabled, performing direct login with provider: ${providerName}`);
    await authProvider.login(page);
    return;
  }

  // Auth storage is enabled, check for valid cached state
  const { validityMinutes, provider } = authStorage;
  const envName = process.env.TEST_ENV || "default";
  const storagePath = getStoragePath(provider, envName, creds.username);

  let needsLogin = true;

  if (isAuthStoreValid(storagePath, validityMinutes)) {
    console.log(`[Framework] Found valid auth store: ${storagePath}`);
    try {
      const state = JSON.parse(require("fs").readFileSync(storagePath, "utf-8"));
      await page.context().addCookies(state.cookies);
      await page.reload();

      if (!page.url().includes("/auth/login")) {
        console.log(`[Framework] Reusing valid auth store`);
        needsLogin = false;
      } else {
        console.log("[Framework] Auth store rejected, will re-login...");
      }
    } catch (error) {
      console.log(`[Framework] Failed to load auth store: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (needsLogin) {
    console.log(`[Framework] Performing fresh login with provider: ${providerName}...`);
    await authProvider.login(page);
    await page.context().storageState({ path: storagePath });
    console.log(`[Framework] New auth store created: ${storagePath}`);
  }
}
