import fs from "fs";
import { Page } from "@playwright/test";
import { AuthProvider, AuthStorageConfig, Creds, ProviderRegistry } from "../../types/auth";
import { getStoragePath }   from "./storagePath";
import { isAuthStoreValid } from "./validateStore";
import { resolveProvider }  from "./resolveProvider";
import { restoreSession }   from "./restoreSession";
import { resolveEnv } from "../env";
import { log } from "../../logger";

/**
 * Manages UI authentication with optional storage-state caching.
 *
 *   1. authStorage disabled       → login directly, no caching
 *   2. valid cached session       → restore + skip login
 *   3. no/expired cached session  → fresh login + save
 *
 * Providers may implement `capture`/`restore` for custom state (e.g. tokens
 * in localStorage under non-standard keys); otherwise Playwright's native
 * `context.storageState()` is used.
 */
export async function initAuthSession(
  page:             Page,
  authStorage:      AuthStorageConfig | undefined,
  creds:            Creds,
  providerRegistry: ProviderRegistry<AuthProvider>
): Promise<void> {
  const providerName = authStorage?.provider ?? "default";
  const ProviderClass = resolveProvider(providerName, providerRegistry);
  const provider = new ProviderClass(creds);

  if (!authStorage?.enabled) {
    log.debug("auth storage disabled — direct login");
    await provider.login(page);
    return;
  }

  const { validityMinutes } = authStorage;
  const storagePath = getStoragePath(providerName, resolveEnv(), creds.username);

  if (isAuthStoreValid(storagePath, validityMinutes)) {
    log.info(`restoring auth store: ${storagePath}`);
    await restoreSession(page, storagePath, provider);
    return;
  }

  log.info(`performing fresh login for ${creds.username}`);
  await provider.login(page);

  if (provider.capture) {
    const state = await provider.capture(page);
    fs.writeFileSync(
      storagePath,
      JSON.stringify({ custom: state, savedAt: Date.now() }, null, 2)
    );
  } else {
    await page.context().storageState({ path: storagePath });
  }
  log.info(`auth store saved: ${storagePath}`);
}
