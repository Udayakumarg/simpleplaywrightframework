import { TestInfo } from "@playwright/test";
import { loadTestData } from "../loaders/data.loader";
import { Scenario } from "../types/scenario";

export const dataFixture = {
  td: async ({}, use: (td: Scenario[] | object) => Promise<void>, testInfo: TestInfo) => {
    const envName = process.env.TEST_ENV || "qa";
    const tag = process.env.SCENARIO_TAG;

    console.log("I am inside Fixture");

    let td: any;
    try {
      td = loadTestData(testInfo, envName);
      //console.log("Loaded test data:", td, "Type:", Array.isArray(td) ? "array" : typeof td);
    } catch (err) {
      console.error(`❌ loadTestData threw for env '${envName}':`, err);
      throw err;
    }

    if (!td || (Array.isArray(td) && td.length === 0)) {
      throw new Error(`❌ No test data found for ${testInfo.file} in environment '${envName}'`);
    }

    // ✅ Only filter if data is an array of scenarios
    if (Array.isArray(td)) {
      td = td.filter(sc => !tag || sc.tags?.includes(tag));
      if (td.length === 0) {
        throw new Error(`❌ No scenarios found for env="${envName}" with tag="${tag}"`);
      }
      console.log(`✅ Loaded ${td.length} scenarios [env=${envName}${tag ? `, tag=${tag}` : ""}]`);
    } else {
      console.log("✅ Loaded test data object (no tag filtering applied)");
    }

    await use(td);
  },
};
