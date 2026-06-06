import fs from "fs";
import { Page } from "@playwright/test";
import { AuthProvider } from "../../types/auth";

/**
 * Restores a saved auth session into the page.
 *
 *   { custom, savedAt }       → provider.restore(page, custom)
 *   { cookies, origins, ... } → Playwright storageState (cookies + localStorage origins)
 */
export async function restoreSession(
  page:        Page,
  storagePath: string,
  provider:    AuthProvider
): Promise<void> {
  const raw = fs.readFileSync(storagePath, "utf-8").trim();
  const state = JSON.parse(raw);

  if (state.custom !== undefined && provider.restore) {
    await provider.restore(page, state.custom);
    return;
  }

  if (Array.isArray(state.cookies) && state.cookies.length > 0) {
    await page.context().addCookies(state.cookies);
  }
  if (Array.isArray(state.origins)) {
    for (const origin of state.origins) {
      if (!origin.localStorage?.length) continue;
      await page.addInitScript((items: Array<{ name: string; value: string }>) => {
        for (const it of items) localStorage.setItem(it.name, it.value);
      }, origin.localStorage);
    }
  }
}
