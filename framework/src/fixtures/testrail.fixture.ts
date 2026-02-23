import { TestRailClient } from "../utils/testrail.client";
import { TestFixture } from "@playwright/test";

export const testrailFixture: {
  testrail: TestFixture<TestRailClient | null, {}>
} = {
  testrail: async ({}, use) => {
    // TestRail fixture is optional - only initialize if env vars are provided
    if (!process.env.TESTRAIL_URL || !process.env.TESTRAIL_USER || !process.env.TESTRAIL_APIKEY) {
      console.log("[Framework] TestRail env vars not found, skipping TestRail integration");
      await use(null);
      return;
    }

    const client = new TestRailClient(
      process.env.TESTRAIL_URL,
      process.env.TESTRAIL_USER,
      process.env.TESTRAIL_APIKEY
    );
    await use(client);
  },
};
