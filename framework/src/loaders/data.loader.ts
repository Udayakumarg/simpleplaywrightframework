import fs from "fs";
import path from "path";
import { TestInfo } from "@playwright/test";
export function loadTestData(testInfo: TestInfo, envName: string): any {
  const projectRoot = process.cwd();
  const rel = path.relative(path.join(projectRoot, "tests"), testInfo.file);
  const fileBase = path.basename(rel)
    .replace(/\.spec\.ts$/, "")
    .replace(/\.test\.ts$/, "");
  const dir = path.dirname(rel);
  const dataPath = path.join(projectRoot, "data", dir, `${fileBase}.json`);

  if (!fs.existsSync(dataPath)) {
    throw new Error(`❌ No data file found for test: ${dataPath}`);
  }

  const raw = fs.readFileSync(dataPath, "utf-8").trim();
  if (!raw) {
    throw new Error(`❌ Data file is empty: ${dataPath}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`❌ Invalid JSON format in ${dataPath}`);
  }

  // ✅ Force any here
  if (parsed[envName]) {
    return parsed[envName] as any;
  }
  return undefined;
}
