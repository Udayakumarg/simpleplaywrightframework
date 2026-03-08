#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(res => rl.question(q, ans => res(ans.trim())));

async function scaffoldFile(filePath, content) {
  if (fs.existsSync(filePath)) {
    console.log(`⚠️ ALERT: ${filePath} already exists.`);
    const ans = await ask(`Do you want to overwrite ${filePath}? (y/N): `);
    if (ans.toLowerCase() !== "y") {
      console.log(`❌ Skipped ${filePath}`);
      return;
    }
    console.log(`✅ Approved overwrite for ${filePath}`);
  } else {
    const ans = await ask(`Create new file ${filePath}? (y/N): `);
    if (ans.toLowerCase() !== "y") {
      console.log(`❌ Skipped ${filePath}`);
      return;
    }
    console.log(`✅ Approved creation of ${filePath}`);
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
  console.log(`📄 File created/updated: ${filePath}`);
}

(async () => {
  const cwd = process.cwd();
  console.log("🚀 Starting framework integration with confirmations...");

  // config
  await scaffoldFile(path.join(cwd, "config/environments.json"),
    JSON.stringify({
      defaults: { timeout: 30000, retries: 1, autoLaunch: false },
      qa: { baseUrl: "http://localhost:3000", authStorage: { enabled: true, provider: "OrangeHRMLogin" } }
    }, null, 2)
  );

  // data/login
  await scaffoldFile(path.join(cwd, "data/login/login.json"),
    JSON.stringify({ qa: { users: { admin: { username: "Admin", password: "admin123" } } } }, null, 2)
  );
  await scaffoldFile(path.join(cwd, "data/login/login.scenarios.json"),
    JSON.stringify({ qa: [
      { name: "Valid login", username: "Admin", password: "admin123", expected: "success" },
      { name: "Invalid login", username: "WrongUser", password: "WrongPass", expected: "failure" }
    ] }, null, 2)
  );
  await scaffoldFile(path.join(cwd, "data/login/loginwithauthstorage.json"),
    JSON.stringify({ qa: { users: { admin: { username: "Admin", password: "admin123" } } } }, null, 2)
  );

  // data/api
  await scaffoldFile(path.join(cwd, "data/api/payload.json"),
    JSON.stringify({ createUser: { username: "demoUser", password: "demoPass" } }, null, 2)
  );

  // data/ui
  await scaffoldFile(path.join(cwd, "data/ui/sample.txt"), "This is a sample file used for upload tests.\n");

  // storage
  await scaffoldFile(path.join(cwd, "storage/authStorage.json"),
    JSON.stringify({ session: { validityMinutes: 30, provider: "OrangeHRMLogin" } }, null, 2)
  );

  // auth
  await scaffoldFile(path.join(cwd, "auth/orangehrm.login.ts"), `import { Page } from '@playwright/test';
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

  // tests/login
  await scaffoldFile(path.join(cwd, "tests/login/login.test.ts"), `import { test, expect } from 'simple-playwright-framework';
test('login with Admin user @smoke', async ({ page, envConfig, td }) => {
  await page.goto(envConfig.baseUrl);
  await page.fill('input[name="username"]', td.users.admin.username);
  await page.fill('input[name="password"]', td.users.admin.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/dashboard/);
});
`);

  await scaffoldFile(path.join(cwd, "tests/login/login.scenarios.spec.ts"), `import { test, expect, scenarioLoader, initAuthSession } from 'simple-playwright-framework';
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

  await scaffoldFile(path.join(cwd, "tests/login/loginwithauthstorage.spec.ts"), `import { test, expect, initAuthSession } from 'simple-playwright-framework';
import { providerRegistry } from '@project/auth';
test('login with Admin user using Auth Storage', async ({ page, envConfig, td }) => {
  await page.goto(envConfig.baseUrl);
  await initAuthSession(page, envConfig.authStorage!, { username: td.users.admin.username, password: td.users.admin.password }, providerRegistry);
  await expect(page).toHaveURL(/dashboard/);
});
`);

  await scaffoldFile(path.join(cwd, "tests/login/login.testrail.spec.ts"), `import { test, expect } from 'simple-playwright-framework';
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

  // tests/filehandling
  await scaffoldFile(path.join(cwd, "tests/filehandling/filehandling.spec.ts"), `import { test } from 'simple-playwright-framework/fixtures';
test("upload and download demo", async ({ page, fileUtils }) => {
  await page.goto("https://the-internet.herokuapp.com/upload");
  await fileUtils.uploadFile("#file-upload", "data/ui/sample.txt");
  await page.click("#file-submit");
  await page.goto("https://the-internet.herokuapp.com/download");
  const downloadedPath = await fileUtils.downloadFile("a[href*='some-file.txt']");
  console.log("Downloaded file path:", downloadedPath);
});
`);

  // tests/api
  await scaffoldFile(path.join(cwd, "tests/api/api.test.ts"), `import { test, expect } from 'simple-playwright-framework';
test('sample API call', async ({ request, envConfig }) => {
  const response = await request.get(\`\${envConfig.baseUrl}/api/health\`);
  expect(response.status()).toBe(200);
});
`);

  // tests/utils
  await scaffoldFile(path.join(cwd, "tests/utils/fileutils.test.ts"), `import { test } from 'simple-playwright-framework/fixtures';
test('use fileUtils directly', async ({ fileUtils }) => {
  const path = await fileUtils.downloadFile("https://example.com/file.txt");
  console.log("Downloaded:", path);
});
`);

  // tests/reporting
  await scaffoldFile(path.join(cwd, "tests/reporting/testrail.test.ts"), `import { test } from 'simple-playwright-framework';
test('reporting example', async ({ testrail }) => {
  await testrail.addResult(5678, 1, "Reporting fixture works ✅");
});
`);

  rl.close();
  console.log("\n🎉 Framework integration complete with confirmations.");
  console.log("👉 Next step: commit and push these changes to GitHub:");
  console.log("   git add . && git commit -m \"Integrate Playwright framework\" && git push");
})();
