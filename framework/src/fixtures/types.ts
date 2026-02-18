import type { EnvConfig } from "../loaders/envConfig.loader";
import type { TestRailClient } from "../utils/testrail.client";

/**
 * Central fixture contract for Playwright test.extend
 */
export type Fixtures = {
  envConfig: EnvConfig;
  td: any;
  testrail: TestRailClient;
};

