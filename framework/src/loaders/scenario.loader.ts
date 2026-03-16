import * as fs   from "fs";
import * as path from "path";
import { Scenario } from "../types/scenario";

export function scenarioLoader(
  testFile:      string,
  dataFileName?: string  // ← only argument needed
): Scenario[] {
  const env = process.env.TEST_ENV      || "qa";
  const tag = process.env.SCENARIO_TAG  || "";
  
  // ── Resolve data file path ────────────────────────────────────
  // Default: replace "tests" → "data" and ".spec.ts" → ".json"
  // Override: if dataFileName provided, keep folder but swap filename
  let scenarioFile: string;

  if (dataFileName) {
    const folderPath = testFile
      .replace("tests", "data")
      .replace(/[^/\\]+\.spec\.ts$/, "");               // strip filename, keep folder
    scenarioFile = path.resolve(path.join(folderPath, dataFileName + ".json"));
  } else {
    const relPath = testFile
      .replace("tests", "data")
      .replace(/\.spec\.ts$/, ".json");
    scenarioFile = path.resolve(relPath);
  }

  if (!fs.existsSync(scenarioFile)) {
    throw new Error(`❌ Scenario file not found: ${scenarioFile}`);
  }

  const raw = fs.readFileSync(scenarioFile, "utf-8").trim();
  if (!raw) {
    throw new Error(`❌ Scenario file is empty: ${scenarioFile}`);
  }

  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`❌ Invalid JSON format in scenario file: ${scenarioFile}`);
  }

  let scenarios: Scenario[];

  if (Array.isArray(parsed)) {
    scenarios = parsed;
  } else if (parsed[env] && Array.isArray(parsed[env])) {
    scenarios = parsed[env];
  } else {
    throw new Error(
      `❌ Scenario file must contain an array or an object with environment key "${env}"`
    );
  }

  if (tag) {
    scenarios = scenarios.filter(sc => sc.tags?.includes(tag));
    if (scenarios.length === 0) {
      throw new Error(`❌ No scenarios found for env="${env}" with tag="${tag}"`);
    }
  }

  console.log(
    `✅ Loaded ${scenarios.length} scenarios [env=${env}${tag ? `, tag=${tag}` : ""}${dataFileName ? `, file=${dataFileName}` : ""}]`
  );

  return scenarios;
}