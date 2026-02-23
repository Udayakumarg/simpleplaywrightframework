import { test as base } from "@playwright/test";

export const simpleFixture = base.extend<{ murali: string }>({
  murali: async ({}, use) => {
    const data = "Hello world";
    await use(data);
  },
});







base.extend