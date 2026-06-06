import { TestRailClient } from "../utils/testrail.client";

export const testrailFixture = {
  testrail: async ({}, use: (client: TestRailClient) => Promise<void>) => {
    const client = new TestRailClient(
      process.env.TESTRAIL_URL,
      process.env.TESTRAIL_USER,
      process.env.TESTRAIL_APIKEY
    );
    try {
      await use(client);
    } finally {
      await client.dispose();
    }
  },
};
