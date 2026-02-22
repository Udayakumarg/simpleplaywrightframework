// framework/src/loaders/envConfig.loader.ts
import fs from "fs";
import path from "path";
import type { AuthStorageConfig } from "../fixtures/auth.contract";

export interface EnvConfig {
  baseUrl: string;
  apiUrl?: string;
  db?: {
    host: string;
    port: number;
    user: string;
    password: string;
  };
  authStorage?: AuthStorageConfig; // 👈 optional, only some envs have it
}

export function loadConfig(): EnvConfig {
  const configPath = path.join(process.cwd(), "config", "environments.json");
  if (!fs.existsSync(configPath)) {
    throw new Error(`❌ environments.json not found at ${configPath}`);
  }

  const raw = fs.readFileSync(configPath, "utf-8");
  const allConfig = JSON.parse(raw);

  const envName = process.env.TEST_ENV || "qa";
  const defaults = allConfig.defaults || {};
  const envConfig = allConfig[envName]; // ✅ flat lookup

  if (!envConfig) {
    throw new Error(
      `❌ Environment '${envName}' not defined in environments.json`,
    );
  }
  if (!envConfig.baseUrl) {
    throw new Error(`❌ Environment '${envName}' missing baseUrl`);
  }

  return { ...defaults, ...envConfig };
}
