import { Page } from "@playwright/test";

/**
 * Contract for all login providers.
 * Each project must implement this interface for its own login flow.
 */
export interface AuthProvider {
  login(page: Page): Promise<void>;
}

/**
 * Contract for the authStorage block in environment configs.
 * This is the only part of envConfig the framework cares about.
 */
export interface AuthStorageConfig {
  enabled: boolean;
  validityMinutes: number;
  provider: string;
}
