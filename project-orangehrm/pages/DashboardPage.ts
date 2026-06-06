import { Locator, Page, expect } from "@playwright/test";
import { BasePage } from "simple-playwright-framework";

export class DashboardPage extends BasePage {
  readonly userMenu: Locator;
  readonly header:   Locator;

  constructor(page: Page) {
    super(page);
    this.userMenu = this.$(".oxd-userdropdown");
    this.header   = this.$(".oxd-topbar-header");
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/dashboard/);
    await expect(this.header).toBeVisible();
  }

  async isReady(): Promise<boolean> {
    return this.header.isVisible();
  }
}
