import { test as base } from "@playwright/test";
import { envConfigFixture } from "./envConfig.fixture";
import { dataFixture } from "./data.fixture";
import { Fixtures } from "./types";

export const test = base.extend<Fixtures>({
  ...envConfigFixture,
  ...dataFixture,
});
