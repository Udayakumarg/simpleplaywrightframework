import { loadConfig } from "../loaders/envConfig.loader";
import type { EnvConfig } from "../types/env";

export const envConfigFixture = {
  envConfig: async ({}, use: (config: EnvConfig) => Promise<void>) => {
    await use(loadConfig());
  },
};
