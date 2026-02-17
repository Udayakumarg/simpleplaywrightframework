import * as fs from "fs";
import * as path from "path";

export interface Scenario {
  [key: string]: string;
}

export function scenarioLoader(testFile: string, env: string = process.env.TEST_ENV || "dev"): Scenario[] {
  const baseName = path.basename(testFile, ".spec.ts");
  const scenarioFile = path.resolve(path.dirname(testFile), "..", "data", `${baseName}.json`);

  const raw = fs.readFileSync(scenarioFile, "utf-8");
  const parsed = JSON.parse(raw);

  // If top-level is an array, return it directly
  if (Array.isArray(parsed)) {
    return parsed;
  }

  // If top-level is an object keyed by env, return the matching array
  if (parsed[env] && Array.isArray(parsed[env])) {
    return parsed[env];
  }

  throw new Error(`Scenario file must contain an array or an object with environment key "${env}"`);
}

