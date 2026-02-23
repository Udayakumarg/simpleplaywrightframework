// framework/src/fixtures/env.fixture.ts
import { test as base } from "@playwright/test";
import { loadConfig } from "../loaders/envConfig.loader";

type EnvConfig = ReturnType<typeof loadConfig>;

export const test = base.extend<{ envConfig: EnvConfig }>({
  envConfig: async ({}, use) => {
    const config = loadConfig(process.env.TEST_ENV || "qa");
    await use(config);
  }
});

// 👇 explicitly mark worker scope
(test as any)._fixtures.envConfig[1].scope = "worker";
