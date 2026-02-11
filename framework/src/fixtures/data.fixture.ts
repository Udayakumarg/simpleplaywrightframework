import { TestInfo } from "@playwright/test";
import { loadTestData } from "../loaders/data.loader";

export const dataFixture = {
  td: async (
    {},
    use: (td: Record<string, any>) => Promise<void>,
    testInfo: TestInfo
  ) => {
    const envName = process.env.TEST_ENV || "qa";
    const td = loadTestData(testInfo, envName);

    if (!td || Object.keys(td).length === 0) {
      throw new Error(`❌ No test data found for ${testInfo.file} in environment '${envName}'`);
    }

    await use(td);
  },
};
