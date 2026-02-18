import { test as base } from "@playwright/test";
import { envConfigFixture } from "./envConfig.fixture";
import { dataFixture } from "./data.fixture";
import { Fixtures } from "./types";
import { testrailFixture } from "./testrail.fixture";

export const test = base.extend<Fixtures>({
  ...envConfigFixture,
  ...dataFixture,
  ...testrailFixture,
});
