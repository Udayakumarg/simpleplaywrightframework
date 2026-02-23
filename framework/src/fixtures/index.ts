import { test as base, Page } from "@playwright/test";
import { envConfigFixture } from "./envConfig.fixture";
import { dataFixture } from "./data.fixture";
import { Fixtures } from "../types/fixtures";
import { testrailFixture } from "./testrail.fixture";
import { apiFixture } from "./api.fixture";
import { initAuthSession } from "../utils/auth-session/initAuthSession";
import type { ApiClient } from "../utils/api-client";
import type { ApiAuthStorage } from "../utils/api-auth-storage";
import type { ApiValidator } from "../utils/api-validators";

export const test = base.extend<
  Fixtures & {
    authStore: (
      page: Page,
      creds: { username: string; password: string },
      providerRegistry: Record<string, any>,
    ) => Promise<void>;
    apiClient: ApiClient;
    apiAuth: ApiAuthStorage;
    apiValidator: typeof ApiValidator;
  }
>({
  ...envConfigFixture,
  ...dataFixture,
  ...testrailFixture,
  ...apiFixture,

  authStore: async ({ envConfig }, use) => {
    await use(async (page, creds, providerRegistry) => {
      if (!envConfig.authStorage) {
        throw new Error(
          `[Framework] authStorage block missing in envConfig for this environment`,
        );
      }
      await initAuthSession(page, envConfig.authStorage, creds, providerRegistry);
    });
  },
});

export { expect } from "@playwright/test";
export * from "../loaders/scenario.loader"; // ✅ keep scenarioLoader export
