// ════════════════════════════════════════════════════════════════
// framework/src/fixtures/index.ts
//
// MODIFIED — added projectConfigFixture alongside existing fixtures.
// Only this block is new:
//   ...projectConfigFixture,
// Everything else is unchanged from your original file.
// ════════════════════════════════════════════════════════════════

import { test as base, Page }     from "@playwright/test";
import { envConfigFixture }        from "./envConfig.fixture";
import { dataFixture }             from "./data.fixture";
import { testrailFixture }         from "./testrail.fixture";
import { fileFixture }             from "./file.fixture";
import { projectConfigFixture }    from "./projectConfig.fixture";   // ← NEW
import { Fixtures }                from "../types/fixtures";
import { initAuthSession }         from "../utils/auth-session/initAuthSession";

export const test = base.extend<
  Fixtures & {
    pc: Record<string, any>;                                          // ← NEW
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
  ...fileFixture,
  ...projectConfigFixture,                                            // ← NEW

  authStore: async ({ envConfig }, use) => {
    await use(async (page, creds, providerRegistry) => {
      if (!envConfig.authStorage) {
        throw new Error(
          `[Framework] authStorage block missing in envConfig for this environment`,
        );
      }
      await initAuthSession(
        page,
        envConfig.authStorage,
        creds,
        providerRegistry,
      );
    });
  },
});

export { expect } from "@playwright/test";
export * from "../loaders/scenario.loader";           // ← NEW
