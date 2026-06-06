export const DEFAULT_ENV = "qa";

export function resolveEnv(): string {
  return process.env.TEST_ENV?.trim() || DEFAULT_ENV;
}

export function resolveTag(): string | undefined {
  const t = process.env.SCENARIO_TAG?.trim();
  return t ? t : undefined;
}
