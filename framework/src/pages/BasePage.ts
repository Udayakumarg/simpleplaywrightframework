import { Locator, Page } from "@playwright/test";

/**
 * Common parent for all Page Objects.
 * Wraps a Playwright `Page` and provides small ergonomics most pages need.
 * Page objects should expose readonly `Locator` fields and intent-named methods —
 * never raw selectors in callers.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /** Navigate to a path relative to envConfig.baseUrl (or absolute URL). */
  async goto(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: "domcontentloaded" });
  }

  protected $(selector: string): Locator {
    return this.page.locator(selector);
  }

  /** Convenience used by tests when a page exposes a "ready" signal. */
  abstract isReady(): Promise<boolean>;
}
