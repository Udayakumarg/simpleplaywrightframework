import fs from "fs";
import path from "path";
import { Page } from "@playwright/test";
import { AuthProvider, AuthStorageConfig } from ".//../fixtures/auth.contract"; 
// 👆 import both interfaces from the contract file

export async function initAuthSession(
  page: Page,
  authStorage: AuthStorageConfig,   // 👈 typed against the contract
  creds: { username: string; password: string },
  providerRegistry: Record<string, new (creds: { username: string; password: string }) => AuthProvider>
) {
  const { enabled, validityMinutes, provider } = authStorage;

  const storageDir = path.resolve("storage");
  if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });
  const storagePath = path.join(storageDir, `${provider}-auth.json`);

  const ProviderClass = providerRegistry[provider];
  if (!ProviderClass) throw new Error(`[Framework] Unknown provider: ${provider}`);

  const authProvider: AuthProvider = new ProviderClass(creds);

  if (!enabled) {
    await authProvider.login(page);
    return;
  }

  if (fs.existsSync(storagePath)) {
    const stats = fs.statSync(storagePath);
    const ageMinutes = (Date.now() - stats.mtimeMs) / 60000;
    if (ageMinutes < validityMinutes) {
      console.log(`[Framework] Reusing existing auth store: ${storagePath}`);
      return;
    }
  }

  await authProvider.login(page);
  await page.context().storageState({ path: storagePath });
  console.log(`[Framework] New auth store created: ${storagePath}`);
}
