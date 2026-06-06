# PlaywrightFramework

Monorepo housing the [**`simple-playwright-framework`**](framework/) library and an example consumer ([`project-orangehrm`](project-orangehrm/)).

## Layout

```
.
├── framework/             # The published package (src/, scripts/, README)
├── project-orangehrm/     # Demo consumer: env-aware config, POM, auth providers
├── .github/workflows/     # CI pipeline
└── docs/                  # Topical guides
```

## Architecture at a glance

- **`defineFrameworkConfig`** — wraps Playwright's `defineConfig`. Loads `.env`, reads `config/environments.json`, applies `defaults` (timeout/retries/workers/headless), emits one project per browser × env.
- **`envConfigFixture`** — injects the resolved `EnvConfig` into every test.
- **`dataFixture` (`td`) + `scenarioLoader`** — `tests/foo/bar.spec.ts` ⇄ `data/foo/bar.json`. JSON is keyed by env; `${VAR}` placeholders are resolved against `process.env`. Scenarios can be filtered by `SCENARIO_TAG`.
- **`projectConfigFixture` (`pc`)** — env-agnostic constants from `config/projectConfig.json`.
- **Auth providers** — implement `AuthProvider` (UI) or `ApiAuthProvider` (API). Register in a `providerRegistry`. `initAuthSession`/`initApiAuthSession` handle caching with per-provider `capture`/`restore` hooks.
- **Page Object Model** — `BasePage` parent, project-defined POMs, exposed as fixtures via `test.extend`.
- **`FileUtils`** — upload/download helpers as a fixture.
- **`TestRailClient`** — thin wrapper using Playwright's `APIRequestContext`.

## Getting started (consumer)

```bash
npm install --save-dev @playwright/test simple-playwright-framework
npx playwright install

# Scaffold a demo
npx init-demo-project

# Configure secrets
cp .env.example .env
# fill in URLs and credentials

# Run
npx playwright test
```

## Developing on this repo

```bash
npm install                # installs all workspaces
npm run build:framework    # compile framework to dist/
npm test                   # runs the orangehrm tests
npm run lint
npm run typecheck
```

## Environment variables

| Variable                 | Purpose                                         |
| ------------------------ | ----------------------------------------------- |
| `TEST_ENV`               | Slice of `environments.json` to read (default `qa`) |
| `BROWSER`                | Narrow browsers (overrides `defineFrameworkConfig`)  |
| `SCENARIO_TAG`           | Filter scenarios returned by `scenarioLoader`        |
| `FRAMEWORK_DEBUG`        | Enable `log.debug(...)` output                       |
| `FRAMEWORK_STORAGE_DIR`  | Override the auth-storage directory                  |
| `TESTRAIL_URL/USER/APIKEY` | TestRail credentials (optional)                    |

## Further reading

- [Auth providers and session caching](docs/auth.md)
- [Scenario-driven tests](docs/scenarios.md)
- [Page Object Model](docs/pom.md)

## License

MIT
