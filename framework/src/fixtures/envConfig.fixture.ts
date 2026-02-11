// envConfig.fixture.ts
import { Page } from "@playwright/test";
import { loadConfig, EnvConfig } from "../loaders/envConfig.loader";

export const envConfigFixture = {
  envConfig: async (
    { page }: { page: Page },
    use: (config: EnvConfig) => Promise<void>,
  ) => {
    const config = loadConfig();
    console.log("🌐 Auto-launching:", config.baseUrl);

    if (config.autoLaunch && config.baseUrl) {
      console.log(`🌐 Navigating to: ${config.baseUrl}`);
      await page.goto(config.baseUrl, { waitUntil: "domcontentloaded" });
      console.log("✅ Navigation complete");
    }

    await use(config);
  },
};
