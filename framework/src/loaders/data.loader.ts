import fs from "fs";
import path from "path";
import { TestInfo } from "@playwright/test";

const TEST_SUFFIX = /\.(spec|test)\.ts$/;

/**
 * Loads environment-specific test data for a given test file.
 * Path convention: tests/foo/bar.spec.ts  →  data/foo/bar.json
 * The JSON top-level keys are environment names; the matching slice is returned.
 */
export function loadTestData<T = any>(testInfo: TestInfo, envName: string): T {
  const projectRoot = process.cwd();
  const rel = path.relative(path.join(projectRoot, "tests"), testInfo.file);
  const fileBase = path.basename(rel).replace(TEST_SUFFIX, "");
  const dir = path.dirname(rel);
  const dataPath = path.join(projectRoot, "data", dir, `${fileBase}.json`);

  if (!fs.existsSync(dataPath)) {
    throw new Error(`Test data file not found for ${fileBase}\n  expected: ${dataPath}`);
  }

  const raw = fs.readFileSync(dataPath, "utf-8").trim();
  if (!raw) {
    throw new Error(`Test data file is empty: ${dataPath}`);
  }

  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new Error(`Invalid JSON in test data: ${dataPath}\n  ${(e as Error).message}`);
  }

  if (parsed[envName] === undefined) {
    throw new Error(
      `Test data has no entry for env "${envName}" in ${dataPath}\n  available: ${Object.keys(parsed).join(", ")}`
    );
  }
  return parsed[envName];
}
