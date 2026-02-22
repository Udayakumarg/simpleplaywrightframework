import { TestRailClient } from "../utils/testrail.client";
import { TestFixture } from "@playwright/test";

export const testrailFixture: { 
  testrail: TestFixture<TestRailClient, {}> 
} = {
  testrail: async ({}, use) => {
    const client = new TestRailClient(
      process.env.TESTRAIL_URL!,
      process.env.TESTRAIL_USER!,
      process.env.TESTRAIL_APIKEY!
    );
    await use(client);
  },
};
