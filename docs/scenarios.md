# Scenario-driven tests

The framework gives you two ways to read JSON test data — pick whichever fits the test:

| API                           | Returns          | Use when                                  |
| ----------------------------- | ---------------- | ----------------------------------------- |
| `td` fixture                  | Object slice     | The test reads named values (`td.users.admin.username`) |
| `scenarioLoader(__filename)`  | `Scenario[]`     | One test body should run N times over the array |

## File layout

```
tests/login/login.spec.ts
data/login/login.json
```

The framework derives the data path by swapping `tests` → `data` and `.spec.ts|.test.ts` → `.json`.

## JSON shape

```json
{
  "qa": {
    "users": {
      "admin":    { "username": "${ADMIN_USERNAME}", "password": "${ADMIN_PASSWORD}" }
    }
  },
  "prod": {
    "users": {
      "admin":    { "username": "${ADMIN_USERNAME}", "password": "${ADMIN_PASSWORD}" }
    }
  }
}
```

`${VAR}` placeholders are resolved against `process.env`. Missing variables throw at load time — fail loud.

## Scenario arrays

`scenarioLoader` accepts:

```json
{
  "qa": [
    { "name": "valid login",   "username": "Admin",     "password": "admin123", "expected": "success", "tags": ["smoke"] },
    { "name": "invalid login", "username": "WrongUser", "password": "WrongPwd", "expected": "failure", "tags": ["negative"] }
  ]
}
```

```ts
import { scenarioLoader } from "simple-playwright-framework";

const scenarios = scenarioLoader(__filename);

test.describe.parallel("Login", () => {
  for (const sc of scenarios) {
    test(sc.name, async ({ page, loginPage, dashboardPage, envConfig }) => {
      await page.goto(envConfig.baseUrl);
      await loginPage.signIn(sc.username, sc.password);
      if (sc.expected === "success") await dashboardPage.expectLoaded();
      else                            await loginPage.expectLoginFailed();
    });
  }
});
```

Run `SCENARIO_TAG=smoke npm test` to filter at runtime.
