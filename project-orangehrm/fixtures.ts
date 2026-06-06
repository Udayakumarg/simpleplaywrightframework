import { test as base, expect } from "simple-playwright-framework";
import { LoginPage, DashboardPage } from "./pages";

type Pages = {
  loginPage:     LoginPage;
  dashboardPage: DashboardPage;
};

export const test = base.extend<Pages>({
  loginPage:     async ({ page }, use) => { await use(new LoginPage(page)); },
  dashboardPage: async ({ page }, use) => { await use(new DashboardPage(page)); },
});

export { expect };
