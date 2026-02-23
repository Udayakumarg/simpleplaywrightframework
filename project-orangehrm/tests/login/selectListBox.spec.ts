import { test, expect } from "@playwright/test";

test("select option from dropdown", async ({ page }) => {
  // 1. Navigate to the page
  await page.goto("https://www.w3schools.com/tags/tryit.asp?filename=tryhtml_select");

  // 2. Switch into iframe (W3Schools demo runs inside an iframe)
  const frame = page.frameLocator("#iframeResult");

  // 3. Select option by value
  await frame.locator("select").selectOption({ label: "Volvo" });

  // 4. Verify selection
  const selectedValue = await frame.locator("select").inputValue();
  expect(selectedValue).toBe("volvo");
});
