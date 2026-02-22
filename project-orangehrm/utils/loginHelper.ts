// projectA/utils/loginHelper.ts
import { Page } from "@playwright/test";

export async function performLogin(page: Page) {
  await page.goto("https://projectA.example.com/login");
  await page.fill("#userId", "projectAUser");
  await page.fill("#pwd", "projectAPassword");
  await page.click("button.login");
}
