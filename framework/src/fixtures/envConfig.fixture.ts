import { Page } from "@playwright/test";
import { loadConfig } from "../loaders/envConfig.loader";
import type { EnvConfig } from "../types/env";

export const envConfigFixture = {
  envConfig: async (
    { page }: { page: Page },
    use: (config: EnvConfig) => Promise<void>,
  ) => {
    const config = loadConfig();

    /*
    if (config.autoLaunch && config.baseUrl) {
      console.log(`🌐 Navigating to: ${config.baseUrl}`);
      await page.goto(config.baseUrl, { waitUntil: "domcontentloaded" });
      console.log("✅ Navigation complete");
    }
    */

    await use(config);
  },
};
