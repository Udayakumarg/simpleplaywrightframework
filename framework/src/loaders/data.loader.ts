import fs from "fs";
import path from "path";
import { TestInfo } from "@playwright/test";

/**
 * Loads environment-specific test data for a given test file.
 * - Resolves JSON file path based on test file location
 * - Validates existence, non-empty content, and JSON format
 * - Returns environment-specific slice of data
 */
export function loadTestData(testInfo: TestInfo, envName: string): any {
  const projectRoot = process.cwd();

  // Derive relative path from tests/ to the current test file
  const rel = path.relative(path.join(projectRoot, "tests"), testInfo.file);

  // Strip .spec.ts / .test.ts suffix
  const fileBase = path.basename(rel)
    .replace(/\.spec\.ts$/, "")
    .replace(/\.test\.ts$/, "");

  const dir = path.dirname(rel);

  // Construct data file path
  const dataPath = path.join(projectRoot, "data", dir, `${fileBase}.json`);

  // Validate existence
  if (!fs.existsSync(dataPath)) {
    throw new Error(
      `\n❌ Test data file not found for test: ${fileBase}\nPath: ${dataPath}`
    );
  }

  // Validate non-empty
  const raw = fs.readFileSync(dataPath, "utf-8").trim();
  if (!raw) {
    throw new Error(
      `\n❌ Test data file is empty for test: ${fileBase}\nPath: ${dataPath}`
    );
  }

  // Parse JSON
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(
      `\n❌ Invalid JSON format in test data for: ${fileBase}\nPath: ${dataPath}`
    );
  }

  // Return environment-specific slice
  if (parsed[envName]) {
    return parsed[envName];
  }else{
     throw new Error(
      `\n❌ Data is not available for Execution Environment ${envName} in test data for: ${fileBase}\nPath: ${dataPath}`
    );
  }

}
