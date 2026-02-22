import { TestInfo } from "@playwright/test";
import { loadTestData } from "../loaders/data.loader";
import { Scenario } from "../types/scenario";

export const dataFixture = {
  td: async ({}, use: (td: Scenario[]) => Promise<void>, testInfo: TestInfo) => {
    const envName = process.env.TEST_ENV || "qa";
    const tag = process.env.SCENARIO_TAG;

    console.log("I am inside Fixture");

    let td: Scenario[];
    try {
      td = loadTestData(testInfo, envName);
      console.log("Loaded test data:", td, "Type:", typeof td);
    } catch (err) {
      console.error(`\n❌ loadTestData threw for env '${envName}':`, err);
      throw err; // rethrow so Playwright marks the test failed
    }

    if (!td || td.length === 0) {
      throw new Error(
        `\n❌ No test data found for ${testInfo.file} in environment '${envName}'`,
      );
    }

    // ✅ Centralized tag filtering
    td = td.filter(sc => {
      if (tag && !sc.tags?.includes(tag)) return false;
      return true;
    });

    console.log(
      `✅ Loaded ${td.length} scenarios [env=${envName}${tag ? `, tag=${tag}` : ""}]`
    );

    await use(td);
  },
};
