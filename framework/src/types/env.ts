import type { AuthStorageConfig } from "./auth";

export interface EnvDefaults {
  timeout?: number;
  retries?: number;
  workers?: number;
  headless?: boolean;
}

export interface EnvConfig extends EnvDefaults {
  baseUrl: string;
  apiUrl?: string;
  authStorage?: AuthStorageConfig;
  /** Consumer-defined fields — extend the interface in your project for type safety. */
  [key: string]: any;
}
