// framework/src/types/fixtures.ts
import type { EnvConfig } from "./env";
import type { TestrailType } from "./testrail";
/**
 * Central fixture contract for Playwright test.extend
 */
export type Fixtures = {
  envConfig: EnvConfig;
  td: any;
  testrail: TestrailType;
};
