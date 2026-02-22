import { TestInfo } from "@playwright/test";
import { loadTestData } from "../loaders/data.loader";

export const dataFixture = {
  td: async (
    {},
    use: (td: Record<string, any>) => Promise<void>,
    testInfo: TestInfo,
  ) => {
    const envName = process.env.TEST_ENV || "qa";
    console.log("I am inside Fixture");

    let td: any;
    try {
      td = loadTestData(testInfo, envName);
      console.log("Loaded test data:", td, "Type:", typeof td);
    } catch (err) {
      console.error(`❌ loadTestData threw for env '${envName}':`, err);
      throw err; // rethrow so Playwright marks the test failed
    }

    if (!td || Object.keys(td).length === 0) {
      throw new Error(
        `❌ No test data found for ${testInfo.file} in environment '${envName}'`,
      );
    }

    await use(td);
  },
};
