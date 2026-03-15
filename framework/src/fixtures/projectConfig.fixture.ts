
import { Page }              from "@playwright/test";
import { loadProjectConfig } from "../loaders/projectConfig.loader";

export const projectConfigFixture = {
  pc: async (
    { page }: { page: Page },
    use: (config: Record<string, any>) => Promise<void>
  ) => {
    const config = loadProjectConfig();
    await use(config);
  },
};
