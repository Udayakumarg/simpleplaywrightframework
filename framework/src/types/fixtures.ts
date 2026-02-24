// framework/src/types/fixtures.ts
import type { EnvConfig } from "./env";
import type { TestrailType } from "./testrail";
import type { FileUtils } from "../utils/file-utils";
/**
 * Central fixture contract for Playwright test.extend
 */
export type Fixtures = {
  envConfig: EnvConfig;
  td: any;
  testrail: TestrailType;
  fileUtils: FileUtils;
};
