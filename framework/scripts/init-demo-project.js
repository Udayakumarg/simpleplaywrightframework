#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const cwd = process.cwd();
const demoDir = path.join(cwd, "demo-project");
fs.mkdirSync(demoDir, { recursive: true });

// package.json
fs.writeFileSync(path.join(demoDir, "package.json"), JSON.stringify({
  name: "demo-project",
  version: "1.0.0",
  private: true,
  scripts: { test: "playwright test" },
  devDependencies: {
    "@playwright/test": "^1.58.2",
    "simple-playwright-framework": "latest"
  }
}, null, 2));

// playwright.config.ts
fs.writeFileSync(path.join(demoDir, "playwright.config.ts"), `import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  reporter: [['html']],
});
`);

// config
const configDir = path.join(demoDir, "config");
fs.mkdirSync(configDir, { recursive: true });
fs.writeFileSync(path.join(configDir, "environments.json"), JSON.stringify({
  defaults: { timeout: 30000, retries: 1, autoLaunch: false },
  dev: { baseUrl: "https://dev.orangehrm.example.com", authStorage: { enabled: true, provider: "OrangeHRMLogin" } },
  qa: { baseUrl: "https://qa.orangehrm.example.com", authStorage: { enabled: true, provider: "OrangeHRMLogin" } },
  prod: { baseUrl: "https://opensource-demo.orangehrmlive.com/", authStorage: { enabled: true, provider: "OrangeHRMLogin" } }
}, null, 2));

// data
const dataDir = path.join(demoDir, "data/login");
fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(path.join(dataDir, "login.json"), JSON.stringify({
  prod: {
    users: {
      admin: { username: "Admin", password: "admin123" },
      employee: { username: "Emp", password: "emp123" },
      locked: { username: "LockedUser", password: "locked123" }
    }
  }
}, null, 2));
fs.writeFileSync(path.join(dataDir, "login.scenarios.json"), JSON.stringify({
  prod: [
    { name: "Valid login", url: "https://opensource-demo.orangehrmlive.com/", username: "Admin", password: "admin123", expected: "success", tags: ["smoke"] },
    { name: "Invalid login", url: "https://opensource-demo.orangehrmlive.com/", username: "WrongUser", password: "WrongPass", expected: "failure", tags: ["negative"] }
  ]
}, null, 2));
fs.writeFileSync(path.join(dataDir, "loginwithauthstorage.json"), JSON.stringify({
  prod: { users: { admin: { username: "Admin", password: "admin123" } } }
}, null, 2));

// auth
const authDir = path.join(demoDir, "auth");
fs.mkdirSync(authDir, { recursive: true });
fs.writeFileSync(path.join(authDir, "orangehrm.login.ts"), `import { Page } from '@playwright/test';
import { AuthProvider } from 'simple-playwright-framework/fixtures/src/types/auth';
export class OrangeHRMLogin implements AuthProvider {
  constructor(private creds: { username: string; password: string }) {}
  async login(page: Page): Promise<void> {
    await page.fill("input[name='username']", this.creds.username);
    await page.fill("input[name='password']", this.creds.password);
    await page.click("button[type='submit']");
    await page.waitForURL("**/dashboard/**");
  }
}
`);

// storage
const storageDir = path.join(demoDir, "storage");
fs.mkdirSync(storageDir, { recursive: true });
fs.writeFileSync(path.join(storageDir, "authStorage.json"), JSON.stringify({
  session: { validityMinutes: 30, provider: "OrangeHRMLogin" }
}, null, 2));

// tests
const testsDir = path.join(demoDir, "tests");
fs.mkdirSync(path.join(testsDir, "login"), { recursive: true });
fs.mkdirSync(path.join(testsDir, "filehandling"), { recursive: true });

fs.writeFileSync(path.join(testsDir, "login/login.test.ts"), `import { test, expect } from 'simple-playwright-framework';
test('login with Admin user @smoke', async ({ page, envConfig, td }) => {
  await page.goto(envConfig.baseUrl);
  await page.fill('input[name="username"]', td.users.admin.username);
  await page.fill('input[name="password"]', td.users.admin.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/dashboard/);
});
`);

fs.writeFileSync(path.join(testsDir, "login/login.scenarios.spec.ts"), `import { test, expect, scenarioLoader, initAuthSession } from 'simple-playwright-framework';
import { providerRegistry } from '@project/auth';
const scenarios = scenarioLoader(__filename);
test.describe.parallel("Login scenarios", () => {
  for (const sc of scenarios) {
    test(\`Scenario: \${sc.name}\`, async ({ page, envConfig }) => {
      await page.goto(envConfig.baseUrl);
      await initAuthSession(page, envConfig.authStorage!, { username: sc.username, password: sc.password }, providerRegistry);
      if (sc.expected === "success") {
        await expect(page).toHaveURL(/.*dashboard.*/);
      } else {
        await expect(page.locator(".oxd-alert-content")).toBeVisible();
      }
    });
  }
});
`);

fs.writeFileSync(path.join(testsDir, "login/loginwithauthstorage.spec.ts"), `import { test, expect, initAuthSession } from 'simple-playwright-framework';
import { providerRegistry } from '@project/auth';
test('login with Admin user using Auth Storage', async ({ page, envConfig, td }) => {
  await page.goto(envConfig.baseUrl);
  await initAuthSession(page, envConfig.authStorage!, { username: td.users.admin.username, password: td.users.admin.password }, providerRegistry);
  await expect(page).toHaveURL(/dashboard/);
});
`);

fs.writeFileSync(path.join(testsDir, "login/login.testrail.spec.ts"), `import { test, expect } from 'simple-playwright-framework';
test('Login linked to TestRail case C1234', async ({ page, envConfig, testrail }) => {
  await page.goto(envConfig.baseUrl);
  await page.fill('input[name="username"]', 'Admin');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  try {
    await expect(page).toHaveURL(/dashboard/);
    await testrail.addResult(1234, 1, "Login passed ✅");
  } catch (err) {
    await testrail.addResult(1234, 5, "Login failed ❌");
    throw err;
  }
});
`);

fs.writeFileSync(path.join(testsDir, "filehandling/filehandling.spec.ts"), `import { test } from 'simple-playwright-framework/fixtures';
test("upload and download demo", async ({ page, fileUtils }) => {
  await page.goto("https://the-internet.herokuapp.com/upload");
  await fileUtils.uploadFile("#file-upload", "data/ui/sample.txt");
  await page.click("#file-submit");
  await page.goto("https://the-internet.herokuapp.com/download");
  const downloadedPath = await fileUtils.downloadFile("a[href*='some-file.txt']");
  console.log("Downloaded file path:", downloadedPath);
});
`);

console.log("✅ Demo project created in ./demo-project with configs, data, auth, storage, and sample tests.");
