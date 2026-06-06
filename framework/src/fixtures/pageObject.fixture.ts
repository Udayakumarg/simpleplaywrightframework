import { Page } from "@playwright/test";
import { BasePage } from "../pages/BasePage";

export type PageObjectCtor<T extends BasePage> = new (page: Page) => T;

/**
 * Wraps a Page Object class so it can be consumed as a Playwright fixture
 * without each project re-implementing the boilerplate.
 *
 *   const { test } = createPageObjectFixtures({
 *     loginPage:     LoginPage,
 *     dashboardPage: DashboardPage,
 *   });
 */
export function createPageObjectFixtures<T extends Record<string, PageObjectCtor<BasePage>>>(map: T) {
  type Pages = { [K in keyof T]: InstanceType<T[K]> };

  const fixtures = {} as Record<keyof T, any>;
  for (const key of Object.keys(map) as Array<keyof T>) {
    fixtures[key] = async (
      { page }: { page: Page },
      use: (instance: InstanceType<T[keyof T]>) => Promise<void>
    ) => {
      const instance = new (map[key])(page) as InstanceType<T[keyof T]>;
      await use(instance);
    };
  }
  return fixtures as { [K in keyof T]: Pages[K] };
}
