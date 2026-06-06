import "tsconfig-paths/register";
import { defineConfig, devices, PlaywrightTestConfig } from "@playwright/test";
import { loadConfig } from "../loaders/envConfig.loader";
import { loadDotenv } from "../utils/dotenv";
import { resolveEnv } from "../utils/env";

type Browser = "chromium" | "firefox" | "webkit";

export interface FrameworkConfigOptions {
  browsers?: Browser[];
  testDir?: string;
  /** Extra overrides — merged on top of derived defaults. */
  override?: Partial<PlaywrightTestConfig>;
}

const DEVICE_FOR: Record<Browser, any> = {
  chromium: devices["Desktop Chrome"],
  firefox:  devices["Desktop Firefox"],
  webkit:   devices["Desktop Safari"],
};

/**
 * Wraps Playwright's defineConfig with framework conventions:
 *  - Loads .env / .env.<TEST_ENV> before reading config
 *  - Pulls timeout / retries / workers / headless from envConfig.defaults
 *  - Emits one Playwright project per browser × env (each tagged with TEST_ENV)
 *  - BROWSER env var, if set, narrows the browser list
 */
export function defineFrameworkConfig(opts: FrameworkConfigOptions = {}) {
  loadDotenv();
  const envConfig = loadConfig();
  const envName = resolveEnv();

  const explicit = (process.env.BROWSER as Browser | undefined);
  const browsers: Browser[] = explicit
    ? [explicit]
    : (opts.browsers && opts.browsers.length > 0 ? opts.browsers : ["chromium"]);

  return defineConfig({
    testDir: opts.testDir ?? "./tests",
    testMatch: ["**/*.spec.ts", "**/*.test.ts"],
    timeout: envConfig.timeout ?? 30_000,
    retries: envConfig.retries ?? 0,
    workers: envConfig.workers,
    reporter: [
      ["html", { open: "never" }],
      ["list"],
    ],
    use: {
      baseURL: envConfig.baseUrl,
      headless: envConfig.headless ?? true,
      navigationTimeout: 60_000,
      actionTimeout: 10_000,
      screenshot: "only-on-failure",
      trace: "retain-on-failure",
      video: "retain-on-failure",
    },
    projects: browsers.map((b) => ({
      name: `${envName}-${b}`,
      use: { browserName: b, ...DEVICE_FOR[b] },
    })),
    ...opts.override,
  });
}
