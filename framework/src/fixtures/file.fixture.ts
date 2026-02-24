import { Page } from "@playwright/test";
import { FileUtils } from "../utils/file-utils";

export const fileFixture = {
  fileUtils: async ({ page }: { page: Page }, use: (value: FileUtils) => Promise<void>) => {
    const utils = new FileUtils(page);
    await use(utils);
  },
};
