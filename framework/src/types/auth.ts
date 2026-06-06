import { APIRequestContext, Page } from "@playwright/test";

export interface Creds {
  username: string;
  password: string;
}

/**
 * UI auth provider — used by initAuthSession.
 * `capture` and `restore` are optional escape hatches for providers that
 * need custom storage handling beyond Playwright's storageState
 * (e.g. tokens persisted in localStorage with non-standard keys).
 */
export interface AuthProvider {
  login(page: Page): Promise<void>;
  capture?(page: Page): Promise<unknown>;
  restore?(page: Page, state: unknown): Promise<void>;
}

/** API auth provider — used by initApiAuthSession. */
export interface ApiAuthProvider {
  getToken(request: APIRequestContext): Promise<string>;
}

export interface AuthStorageConfig {
  enabled: boolean;
  validityMinutes: number;
  provider: string;
}

export type ProviderRegistry<T = AuthProvider | ApiAuthProvider> = Record<
  string,
  new (creds: Creds) => T
>;
