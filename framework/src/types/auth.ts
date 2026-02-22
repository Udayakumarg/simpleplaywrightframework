import { Page } from "@playwright/test";

export interface AuthProvider {
  login(page: Page): Promise<void>;
}

export interface AuthStorageConfig {
  enabled: boolean;
  validityMinutes: number;
  provider: string;
}
