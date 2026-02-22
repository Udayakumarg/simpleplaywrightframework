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
  if (!authStorage?.enabled) {
    console.log("[Framework] Auth storage disabled");
    const ProviderClass = providerRegistry[authStorage?.provider ?? "OrangeHRMLogin"];
    const authProvider: AuthProvider = new ProviderClass(creds);
    await authProvider.login(page);
    return;
  }

  const { validityMinutes, provider } = authStorage;
  const envName = process.env.TEST_ENV || "default";
  const storagePath = getStoragePath(provider, envName, creds.username);

  const ProviderClass = providerRegistry[provider];
  if (!ProviderClass) throw new Error(`[Framework] Unknown provider: ${provider}`);
  const authProvider: AuthProvider = new ProviderClass(creds);

  let needsLogin = true;

  if (isAuthStoreValid(storagePath, validityMinutes)) {
    console.log(`[Framework] Found valid auth store: ${storagePath}`);
    const state = JSON.parse(require("fs").readFileSync(storagePath, "utf-8"));
    await page.context().addCookies(state.cookies);
    await page.reload();

    if (!page.url().includes("/auth/login")) {
      console.log(`[Framework] Reusing valid auth store`);
      needsLogin = false;
    } else {
      console.log("[Framework] Auth store rejected, will re-login...");
    }
  }

  if (needsLogin) {
    console.log("[Framework] Performing fresh login...");
    await authProvider.login(page);
    await page.context().storageState({ path: storagePath });
    console.log(`[Framework] New auth store created: ${storagePath}`);
  }
}
