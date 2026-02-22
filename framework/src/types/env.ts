// framework/src/types/env.ts
import type { AuthStorageConfig } from "./auth";

export interface EnvConfig {
  baseUrl: string;
  apiUrl?: string;
  db?: {
    host: string;
    port: number;
    user: string;
    password: string;
  };
  authStorage?: AuthStorageConfig; // optional, only some envs have it
}
