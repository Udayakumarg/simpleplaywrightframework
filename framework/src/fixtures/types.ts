import type { EnvConfig } from "../loaders/envConfig.loader";

/**
 * Central fixture contract for Playwright test.extend
 */
export type Fixtures = {
  envConfig: EnvConfig;
  td: any;
};
