import * as fs   from "fs";
import * as path from "path";
import { Scenario } from "../types/scenario";
import { log } from "../logger";
import { resolveEnv } from "../utils/env";

const TEST_SUFFIX = /\.(spec|test)\.ts$/;

export function scenarioLoader(
  testFile:      string,
  dataFileName?: string
): Scenario[] {
  const env = resolveEnv();
  const tag = process.env.SCENARIO_TAG || "";

  let scenarioFile: string;
  if (dataFileName) {
    const folderPath = testFile
      .replace(/[\\/]tests[\\/]/, path.sep + "data" + path.sep)
      .replace(/[^/\\]+\.(spec|test)\.ts$/, "");
    scenarioFile = path.resolve(path.join(folderPath, dataFileName + ".json"));
  } else {
    const relPath = testFile
      .replace(/[\\/]tests[\\/]/, path.sep + "data" + path.sep)
      .replace(TEST_SUFFIX, ".json");
    scenarioFile = path.resolve(relPath);
  }

  if (!fs.existsSync(scenarioFile)) {
    throw new Error(`Scenario file not found: ${scenarioFile}`);
  }

  const raw = fs.readFileSync(scenarioFile, "utf-8").trim();
  if (!raw) {
    throw new Error(`Scenario file is empty: ${scenarioFile}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new Error(`Invalid JSON in scenario file: ${scenarioFile}\n${(e as Error).message}`);
  }

  let scenarios: Scenario[];
  if (Array.isArray(parsed)) {
    scenarios = parsed as Scenario[];
  } else if (parsed && typeof parsed === "object" && Array.isArray((parsed as any)[env])) {
    scenarios = (parsed as any)[env];
  } else {
    throw new Error(
      `Scenario file must contain an array or an object keyed by env "${env}": ${scenarioFile}`
    );
  }

  if (tag) {
    scenarios = scenarios.filter(sc => sc.tags?.includes(tag));
    if (scenarios.length === 0) {
      throw new Error(`No scenarios found for env="${env}" with tag="${tag}"`);
    }
  }

  log.info(
    `Loaded ${scenarios.length} scenarios [env=${env}${tag ? `, tag=${tag}` : ""}${dataFileName ? `, file=${dataFileName}` : ""}]`
  );

  return scenarios;
}