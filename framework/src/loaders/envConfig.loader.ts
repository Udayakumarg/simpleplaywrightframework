// framework/src/loaders/envConfig.loader.ts
import fs from "fs";
import path from "path";
import type { EnvConfig } from "../types/env";


export function loadConfig(): EnvConfig {
  const configPath = path.join(process.cwd(), "config", "environments.json");
  if (!fs.existsSync(configPath)) {
    throw new Error(
      `❌ environments.json not found at ${configPath}\n` +
      `💡 Hint: Create config/environments.json with environment configurations\n` +
      `   Example format:\n` +
      `   {\n` +
      `     "defaults": { "timeout": 30000 },\n` +
      `     "qa": { "baseUrl": "https://...", "apiUrl": "https://..." }\n` +
      `   }`
    );
  }

  let allConfig;
  try {
    const raw = fs.readFileSync(configPath, "utf-8");
    allConfig = JSON.parse(raw);
  } catch (error) {
    throw new Error(
      `❌ Invalid JSON in environments.json at ${configPath}\n` +
      `💡 Error: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  const envName = process.env.TEST_ENV || "qa";
  const defaults = allConfig.defaults || {};
  const envConfig = allConfig[envName];

  if (!envConfig) {
    const availableEnvs = Object.keys(allConfig)
      .filter(k => k !== "defaults")
      .join(", ");
    throw new Error(
      `❌ Environment '${envName}' not defined in environments.json\n` +
      `💡 Available environments: ${availableEnvs}\n` +
      `💡 Use: TEST_ENV=${availableEnvs.split(",")[0]} npm test`
    );
  }
  if (!envConfig.baseUrl) {
    throw new Error(
      `❌ Environment '${envName}' missing required 'baseUrl' field\n` +
      `💡 Check config/environments.json and ensure '${envName}' has 'baseUrl' defined`
    );
  }

  return { ...defaults, ...envConfig };
}
