#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const cwd = process.cwd();
const demoDir = path.join(cwd, "demo-project");
fs.mkdirSync(demoDir, { recursive: true });

function writeFileSafe(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
  console.log(`📄 Created: ${filePath}`);
}

function run(cmd, cwd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd });
}

// -------------------- package.json --------------------
writeFileSafe(path.join(demoDir, "package.json"),
  JSON.stringify({
    name: "demo-project",
    version: "1.0.0",
    private: true,
    scripts: {
      init: "node ../framework/scripts/init-demo-project.js",
      clean: "npx rimraf dist tsconfig.tsbuildinfo",
      build: "tsc --build --force",
      test: "playwright test"
    },
    devDependencies: {
      "@playwright/test": "^1.58.2",
      "simple-playwright-framework": "latest",
      "@types/node": "^20.0.0",
      "rimraf": "^5.0.0",
      "node-fetch": "^2.6.7" 
    }
  }, null, 2)
);

// -------------------- tsconfig.json --------------------
writeFileSafe(path.join(demoDir, "tsconfig.json"),
  JSON.stringify({
    compilerOptions: {
      target: "ESNext",
      module: "CommonJS",
      strict: true,
      noImplicitAny: true,
      esModuleInterop: true,
      moduleResolution: "Node",
      resolveJsonModule: true,
      types: ["@playwright/test", "simple-playwright-framework", "node"],
      baseUrl: ".",
      paths: { "@demo-project/*": ["./*"], "@demo-project/auth": ["auth/index.ts"] },
      outDir: "dist"
    },
    include: ["tests/**/*.ts", "global.d.ts"]
  }, null, 2)
);

// -------------------- playwright.config.ts --------------------
writeFileSafe(path.join(demoDir, "playwright.config.ts"), 
`import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  reporter: [['html']],
  use: {
    // keep Playwright's own options here
  },
});

// ✅ Default environment set to "prod"
process.env.TEST_ENV = process.env.TEST_ENV || "prod";
`);


// -------------------- environments.json --------------------
writeFileSafe(path.join(demoDir, "config/environments.json"),
  JSON.stringify({
    defaults: { timeout: 30000, retries: 1, autoLaunch: false },
    dev: { baseUrl: "https://dev.orangehrm.example.com", authStorage: { enabled: true, provider: "OrangeHRMLogin" } },
    qa: { baseUrl: "https://qa.orangehrm.example.com", authStorage: { enabled: true, provider: "OrangeHRMLogin" } },
    prod: { baseUrl: "https://opensource-demo.orangehrmlive.com/", apiUrl: "https://jsonplaceholder.typicode.com", authStorage: { enabled: true, provider: "OrangeHRMLogin" } }
  }, null, 2)
);

// -------------------- Auth Provider --------------------
writeFileSafe(path.join(demoDir, "auth/index.ts"), 
`import { OrangeHRMLogin } from "./orangehrm.login";

export const providerRegistry = {
  OrangeHRMLogin,
};
`);

writeFileSafe(path.join(demoDir, "auth/orangehrm.login.ts"), 
`import { Page } from '@playwright/test';
import { AuthProvider } from 'simple-playwright-framework';
export class OrangeHRMLogin implements AuthProvider {
  constructor(private creds: { username: string; password: string }) {}
  async login(page: Page): Promise<void> {
    await page.fill("input[name='username']", this.creds.username);
    await page.fill("input[name='password']", this.creds.password);
    await page.click("button[type='submit']");
    // No unconditional waitForURL here — handled in tests
  }
}
`);

// -------------------- Data --------------------
writeFileSafe(path.join(demoDir, "data/login/login.json"),
  JSON.stringify({
    prod: {
      users: {
        admin: { username: "Admin", password: "admin123" },
        employee: { username: "Emp", password: "emp123" },
        locked: { username: "LockedUser", password: "locked123" },
        problem: { username: "ProblemUser", password: "problem123" }
      }
    }
  }, null, 2)
);

writeFileSafe(path.join(demoDir, "data/login/login.scenarios.json"),
  JSON.stringify({
    prod: [
      { name: "Valid login", url: "https://opensource-demo.orangehrmlive.com/", username: "Admin", password: "admin123", expected: "success", tags: ["smoke"] },
      { name: "Invalid login", url: "https://opensource-demo.orangehrmlive.com/", username: "WrongUser", password: "WrongPass", expected: "failure", tags: ["negative"] },
      { name: "Valid login Two", url: "https://opensource-demo.orangehrmlive.com/", username: "Admin", password: "admin123", expected: "success", tags: ["regression","positive"] }
    ]
  }, null, 2)
);

writeFileSafe(path.join(demoDir, "data/login/loginwithauthstorage.json"),
  JSON.stringify({ prod: { users: { admin: { username: "Admin", password: "admin123" } } } }, null, 2)
);

writeFileSafe(path.join(demoDir, "data/api/payload.json"),
  JSON.stringify({ createUser: { username: "demoUser", password: "demoPass" } }, null, 2)
);

writeFileSafe(path.join(demoDir, "data/ui/sample.txt"), "This is a sample file used for upload tests.\n");

writeFileSafe(path.join(demoDir, "storage/authStorage.json"),
  JSON.stringify({ session: { validityMinutes: 30, provider: "OrangeHRMLogin" } }, null, 2)
);

// -------------------- Tests --------------------
// Login basic test
writeFileSafe(path.join(demoDir, "tests/login/login.test.ts"), 
`import { test, expect } from 'simple-playwright-framework';
test('login with Admin user @smoke', async ({ page, envConfig, td }) => {
  await page.goto(envConfig.baseUrl);
  await page.fill('input[name="username"]', td.users.admin.username);
  await page.fill('input[name="password"]', td.users.admin.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/dashboard/);
});
`);

// Login scenarios
writeFileSafe(path.join(demoDir, "tests/login/login.scenarios.spec.ts"), 
`import { test, expect, scenarioLoader, initAuthSession } from 'simple-playwright-framework';
import { providerRegistry } from '@demo-project/auth';
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

// Login with auth storage
writeFileSafe(path.join(demoDir, "tests/login/loginwithauthstorage.spec.ts"), 
`import { test, expect, initAuthSession } from 'simple-playwright-framework';
import { providerRegistry } from '@demo-project/auth';
test('login with Admin user using Auth Storage', async ({ page, envConfig, td }) => {
  await page.goto(envConfig.baseUrl);
  await initAuthSession(page, envConfig.authStorage!, { username: td.users.admin.username, password: td.users.admin.password }, providerRegistry);
  await expect(page).toHaveURL(/dashboard/);
});
`);

// Login with TestRail reporting
writeFileSafe(path.join(demoDir, "tests/login/login.testrail.spec.ts"), 
`import { test, expect } from 'simple-playwright-framework';
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

// File handling test (fixed locator)
writeFileSafe(path.join(demoDir, "tests/filehandling/filehandling.spec.ts"), 
`import { test, expect } from 'simple-playwright-framework';

test("upload and download demo", async ({ page, fileUtils }) => {
  // Upload
  await page.goto("https://the-internet.herokuapp.com/upload");
  await fileUtils.uploadFile("#file-upload", "data/ui/sample.txt");
  await page.click("#file-submit");

  // Download
  await page.goto("https://the-internet.herokuapp.com/download");
  const link = page.getByRole('link', { name: 'sample.txt', exact: true });
  await expect(link).toBeVisible();

  const downloadedPath = await fileUtils.downloadFile("a[href='download/sample.txt']");
  console.log("Downloaded file path:", downloadedPath);
});
`);

// API test
writeFileSafe(path.join(demoDir, "tests/api/api.test.ts"), 
`import { test, expect } from 'simple-playwright-framework';
test('sample API call', async ({ request, envConfig }) => {
  console.log("API URL: " + envConfig.apiUrl);
  const response = await request.get(\`\${envConfig.apiUrl}/users\`);
  expect(response.status()).toBe(200);
});
`);

// Reporting example
writeFileSafe(path.join(demoDir, "tests/reporting/testrail.test.ts"), 
`import { test } from 'simple-playwright-framework';
test('reporting example', async ({ testrail }) => {
  await testrail.addResult(5678, 1, "Reporting fixture works ✅");
});
`);

// README
writeFileSafe(path.join(demoDir, "README.md"), 
`# Demo Project

This is a scaffolded Playwright demo project using **simple-playwright-framework**.

## Features
- ✅ UI login scenarios (success & failure)
- ✅ API test using jsonplaceholder
- ✅ File upload & download test with FileUtils
- ✅ Auth storage example
- ✅ TestRail reporting example

## Usage
- Run \`npm run init\` to scaffold the project
- Run \`npm run test\` to execute all sample tests
- Run \`npm run build\` to compile TypeScript
`);

// Final step: install deps + build
try {
  console.log("🚀 Installing dependencies and building demo-project...");
  run("npm install", demoDir);
  run("npm run build", demoDir);
  console.log("✅ Demo project initialized. Ready to run Playwright tests!");
} catch (err) {
  console.error("❌ Init failed:", err.message);
  process.exit(1);
}
