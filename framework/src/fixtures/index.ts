import { test as base, Page } from "@playwright/test";
import { envConfigFixture } from "./envConfig.fixture";
import { dataFixture } from "./data.fixture";
import { Fixtures } from "./types";
import { testrailFixture } from "./testrail.fixture";
import { initAuthSession } from "../utils/auth-storage";

export const test = base.extend<
  Fixtures & {
    authStore: (
      page: Page,
      creds: { username: string; password: string },
      providerRegistry: Record<string, any>,
    ) => Promise<void>;
  }
>({
  ...envConfigFixture,
  ...dataFixture,
  ...testrailFixture,

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
