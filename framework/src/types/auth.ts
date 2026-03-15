import { Page } from "@playwright/test";

// UI auth provider — used by initAuthSession
export interface AuthProvider {
  login(page: Page): Promise<void>;
}

// API auth provider — used by initApiAuthSession
// Returns a token string directly from an API login call
export interface ApiAuthProvider {
  getToken(request: any): Promise<string>;
}

export interface AuthStorageConfig {
  enabled: boolean;
  validityMinutes: number;
  provider: string;
}
