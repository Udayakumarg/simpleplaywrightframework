# Page Object Model

Tests should describe *what* a user does, not *which selectors* the app uses. The framework ships a small `BasePage` and a fixture pattern so projects can keep selectors out of `.spec.ts` files.

## BasePage

```ts
import { BasePage } from "simple-playwright-framework";
import { Locator, Page, expect } from "@playwright/test";

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton:  Locator;
  readonly errorAlert:    Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = this.$("input[name='username']");
    this.passwordInput = this.$("input[name='password']");
    this.submitButton  = this.$("button[type='submit']");
    this.errorAlert    = this.$(".oxd-alert-content");
  }

  async signIn(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectLoginFailed() {
    await expect(this.errorAlert).toBeVisible();
  }

  async isReady() { return this.usernameInput.isVisible(); }
}
```

## Exposing as fixtures

Each project bundles its page objects into a single `test` import:

```ts
// project-orangehrm/fixtures.ts
import { test as base, expect } from "simple-playwright-framework";
import { LoginPage, DashboardPage } from "./pages";

export const test = base.extend<{
  loginPage:     LoginPage;
  dashboardPage: DashboardPage;
}>({
  loginPage:     async ({ page }, use) => { await use(new LoginPage(page)); },
  dashboardPage: async ({ page }, use) => { await use(new DashboardPage(page)); },
});

export { expect };
```

Tests import `test` from there:

```ts
import { test, expect } from "@project/fixtures";

test("login", async ({ page, envConfig, loginPage, dashboardPage }) => {
  await page.goto(envConfig.baseUrl);
  await loginPage.signIn("Admin", "admin123");
  await dashboardPage.expectLoaded();
});
```

## Guidelines

- **Locators are `readonly`** — defined once in the constructor, never re-assigned.
- **Methods are intent-named** — `signIn`, `addEmployee`, `assertWelcomeBanner` — not `clickButton1`.
- **Assertions live on the page object** when they're identity-of-the-page checks (`expectLoaded`, `expectLoginFailed`); leave business assertions in the test.
- **No selectors in `tests/`** — keep them inside the page object.
