import { TestInfo } from "@playwright/test";
import { loadTestData } from "../loaders/data.loader";
import { Scenario } from "../types/scenario";
import { log } from "../logger";
import { resolveEnv } from "../utils/env";

export const dataFixture = {
  td: async ({}, use: (td: Scenario[] | object) => Promise<void>, testInfo: TestInfo) => {
    const envName = resolveEnv();
    const tag = process.env.SCENARIO_TAG;

    let td = loadTestData(testInfo, envName);

    if (!td || (Array.isArray(td) && td.length === 0)) {
      throw new Error(`No test data found for ${testInfo.file} in environment '${envName}'`);
    }

    if (Array.isArray(td)) {
      td = td.filter((sc: Scenario) => !tag || sc.tags?.includes(tag));
      if (td.length === 0) {
        throw new Error(`No scenarios found for env="${envName}" with tag="${tag}"`);
      }
      log.info(`Loaded ${td.length} scenarios [env=${envName}${tag ? `, tag=${tag}` : ""}]`);
    } else {
      log.debug(`Loaded test data object for env=${envName}`);
    }

    await use(td);
  },
};
