import * as fs from "fs";
import * as path from "path";
import { Scenario } from "../types/scenario"; // central type

export function scenarioLoader(
  testFile: string,
  env: string = process.env.TEST_ENV || "qa",
  tag: string = process.env.SCENARIO_TAG || ""
): Scenario[] {
  // Replace "tests" with "data" and change extension
  const relPath = testFile.replace("tests", "data").replace(/\.spec\.ts$/, ".json");
  const scenarioFile = path.resolve(relPath);

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

  // If top-level is an array, return it directly
  if (Array.isArray(parsed)) {
    scenarios = parsed;
  }
  // If top-level is an object keyed by env, return the matching array
  else if (parsed[env] && Array.isArray(parsed[env])) {
    scenarios = parsed[env];
  } else {
    throw new Error(
      `❌ Scenario file must contain an array or an object with environment key "${env}"`
    );
  }

  // ✅ Strict tag filtering
  if (tag) {
    scenarios = scenarios.filter(sc => sc.tags?.includes(tag));
    if (scenarios.length === 0) {
      throw new Error(`❌ No scenarios found for env="${env}" with tag="${tag}"`);
    }
  }

  console.log(
    `✅ Loaded ${scenarios.length} scenarios [env=${env}${tag ? `, tag=${tag}` : ""}]`
  );

  return scenarios;
}
