import type { EnvConfig } from "./env";
import type { TestrailType } from "./testrail";
import type { FileUtils } from "../utils/file-utils";
import type { Scenario } from "./scenario";

/**
 * Central fixture contract for the framework's test.extend.
 * `TData` and `TProjectConfig` may be specialized by consumers:
 *
 *   declare module "simple-playwright-framework" {
 *     interface ProjectFixtures {
 *       td: MyTestData;
 *       pc: MyProjectConfig;
 *     }
 *   }
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export type Fixtures<TData = any, TProjectConfig = Record<string, any>> = {
  envConfig: EnvConfig;
  td: TData;
  pc: TProjectConfig;
  testrail: TestrailType;
  fileUtils: FileUtils;
};
