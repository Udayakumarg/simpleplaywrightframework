# Auth providers and session caching

The framework decouples *how you log in* from *whether sessions are cached*. You write a class that knows how to perform a login; the framework decides whether to call it or restore a previous session from disk.

## Two interfaces

```ts
// UI flow — runs inside a Page
interface AuthProvider {
  login(page: Page): Promise<void>;
  capture?(page: Page): Promise<unknown>;   // optional, for custom state
  restore?(page: Page, state: unknown): Promise<void>;
}

// API flow — returns a token string
interface ApiAuthProvider {
  getToken(request: APIRequestContext): Promise<string>;
}
```

## Registry

Each consumer maintains a registry mapping provider names to constructors:

```ts
// auth/index.ts
import { OrangeHRMLogin } from "./orangehrm.login";
export const providerRegistry = { OrangeHRMLogin };
```

The provider name selected at runtime comes from `environments.json`:

```json
"authStorage": { "enabled": true, "validityMinutes": 30, "provider": "OrangeHRMLogin" }
```

## Storage flow

1. `authStorage.enabled === false` → call `login()` every time.
2. A valid file at `storage/<provider>-<env>-<user>-auth.json` exists and is younger than `validityMinutes` → restore it, skip login.
3. Otherwise → call `login()`, then persist:
   - If `provider.capture` is defined → use that custom state (`{ custom, savedAt }`).
   - Else → write Playwright's native `storageState({ path })` (cookies + origins).

## Custom storage (token-based apps)

For apps that keep auth in `localStorage` under non-standard keys (e.g. `accessToken`), implement `capture`/`restore`:

```ts
class NexusLogin implements AuthProvider {
  async login(page: Page) { /* ... fills the form ... */ }

  async capture(page: Page) {
    return page.evaluate(() => ({
      accessToken: localStorage.getItem("accessToken"),
      profile:     localStorage.getItem("profile"),
    }));
  }

  async restore(page: Page, state: any) {
    await page.addInitScript((s) => {
      localStorage.setItem("accessToken", s.accessToken);
      if (s.profile) localStorage.setItem("profile", s.profile);
    }, state);
  }
}
```

## Hardening

- `storage/` is **gitignored by default** — never commit session files.
- Set `FRAMEWORK_STORAGE_DIR` to redirect storage (useful for ephemeral CI runners).
- Filename usernames are sanitized — emails and domain users are safe.
