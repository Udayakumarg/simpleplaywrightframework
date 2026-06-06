import fs from "fs";
import { APIRequestContext } from "@playwright/test";
import { ApiAuthProvider, AuthStorageConfig, Creds, ProviderRegistry } from "../../types/auth";
import { getStoragePath }   from "./storagePath";
import { isAuthStoreValid } from "./validateStore";
import { resolveProvider }  from "./resolveProvider";
import { resolveEnv } from "../env";
import { log } from "../../logger";

/**
 * Manages API token authentication with optional token caching.
 * Returns a token string ready for an `Authorization` header.
 */
export async function initApiAuthSession(
  request:          APIRequestContext,
  authStorage:      AuthStorageConfig | undefined,
  creds:            Creds,
  providerRegistry: ProviderRegistry<ApiAuthProvider>
): Promise<string> {
  const providerName = authStorage?.provider ?? "default";
  const ProviderClass = resolveProvider(providerName, providerRegistry);
  const provider = new ProviderClass(creds);

  if (!authStorage?.enabled) {
    log.debug("api auth storage disabled — direct login");
    return provider.getToken(request);
  }

  const { validityMinutes } = authStorage;
  const storagePath = getStoragePath(providerName, resolveEnv(), creds.username);

  if (isAuthStoreValid(storagePath, validityMinutes)) {
    const saved = JSON.parse(fs.readFileSync(storagePath, "utf-8"));
    log.info(`using cached API token for ${creds.username}`);
    return saved.token;
  }

  log.info(`performing fresh API login for ${creds.username}`);
  const token = await provider.getToken(request);
  fs.writeFileSync(storagePath, JSON.stringify({ token, savedAt: Date.now() }, null, 2));
  log.info(`API token cached: ${storagePath}`);
  return token;
}
