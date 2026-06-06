# simple-playwright-framework

[![npm version](https://img.shields.io/npm/v/simple-playwright-framework)](https://www.npmjs.com/package/simple-playwright-framework)
[![license](https://img.shields.io/npm/l/simple-playwright-framework)](LICENSE)
![playwright](https://img.shields.io/badge/Playwright-supported-45ba63?logo=playwright)

A lightweight, opinionated automation framework built on top of [Microsoft Playwright](https://playwright.dev).
Helps teams ship UI and API automation projects fast with reusable fixtures, env-aware configuration, a pluggable auth-provider registry, scenario-driven tests, and first-class TypeScript.

Repository: <https://github.com/Udayakumarg/simpleplaywrightframework>

---

## Why this framework

| Concern | What you get |
| --- | --- |
| Environments (`dev` / `qa` / `prod`) | `EnvConfig` loader with safe merging of `defaults` |
| Secrets | `.env` interpolation in `environments.json` — never commit credentials |
| Test data | `tests/foo.spec.ts` ⇄ `data/foo.json` convention, env-keyed |
| Auth | Provider registry + storage-state caching (cookie OR token) |
| Pages | Built-in `BasePage` and `pageObjectFixture` |
| Reporting | Playwright HTML, optional Allure, optional TestRail |
| Cross-browser | One config, all three engines via projects |
| CI | GitHub Actions example, parallel-safe by default |

---

## Install

```bash
npm install --save-dev @playwright/test simple-playwright-framework
npx playwright install
```

## Scaffold a project

```bash
npx init-demo-project
cd demo-project
npm test
```

The scaffolder lays down `tests/`, `pages/`, `data/`, `auth/`, `config/`, and a working `playwright.config.ts`.

## Minimal test

```ts
import { test, expect, scenarioLoader } from "simple-playwright-framework";
import { providerRegistry } from "../auth";

const scenarios = scenarioLoader(__filename);

test.describe.parallel("Login", () => {
  for (const sc of scenarios) {
    test(sc.name, async ({ page, envConfig, loginPage }) => {
      await page.goto(envConfig.baseUrl);
      await loginPage.signIn(sc.username, sc.password);
      if (sc.expected === "success") {
        await expect(page).toHaveURL(/dashboard/);
      } else {
        await expect(loginPage.errorAlert).toBeVisible();
      }
    });
  }
});
```

## Configuration

`config/environments.json`

```json
{
  "defaults": { "timeout": 30000, "retries": 1 },
  "qa":   { "baseUrl": "${QA_BASE_URL}",   "apiUrl": "${QA_API_URL}" },
  "prod": { "baseUrl": "${PROD_BASE_URL}", "apiUrl": "${PROD_API_URL}" }
}
```

`.env`

```bash
QA_BASE_URL=https://qa.example.com
QA_API_URL=https://qa.example.com/api
```

`playwright.config.ts`

```ts
import { defineFrameworkConfig } from "simple-playwright-framework";

export default defineFrameworkConfig({
  browsers: ["chromium"],
});
```

## Run

```bash
# Pick an environment
TEST_ENV=qa npx playwright test

# Filter scenarios by tag (works with scenarioLoader)
SCENARIO_TAG=smoke npx playwright test

# Pick a browser
BROWSER=firefox npx playwright test
```

## API surface

```ts
import {
  test, expect,                         // re-exported with framework fixtures
  defineFrameworkConfig,                // wraps Playwright defineConfig
  scenarioLoader, loadConfig,           // data + env loaders
  initAuthSession, initApiAuthSession,  // auth session helpers
  FileUtils,                            // upload/download utilities
  log,                                  // [Framework] prefixed logger
  type AuthProvider, type ApiAuthProvider, type AuthStorageConfig,
  type EnvConfig, type Scenario,
} from "simple-playwright-framework";
```

## Authentication providers

```ts
// auth/orangehrm.login.ts
import { Page } from "@playwright/test";
import { AuthProvider } from "simple-playwright-framework";

export class OrangeHRMLogin implements AuthProvider {
  constructor(private creds: { username: string; password: string }) {}
  async login(page: Page) {
    await page.fill("input[name='username']", this.creds.username);
    await page.fill("input[name='password']", this.creds.password);
    await page.click("button[type='submit']");
    await page.waitForURL("**/dashboard/**");
  }
}

// auth/index.ts
export const providerRegistry = { OrangeHRMLogin };
```

Providers can opt in to **storage caching** via `envConfig.authStorage`:

```json
"authStorage": { "enabled": true, "validityMinutes": 30, "provider": "OrangeHRMLogin" }
```

A valid session is restored from `storage/<provider>-<env>-<user>-auth.json`; expired sessions trigger a fresh login.

> `storage/` is gitignored by default. Never commit session cookies or tokens.

## License

MIT — Udayakumar
