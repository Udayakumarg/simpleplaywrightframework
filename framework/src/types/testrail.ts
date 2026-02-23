// framework/src/types/testrail.ts
import type { TestRailClient } from "../utils/testrail.client";

/**
 * Type alias for TestRail client fixture (optional - can be null if env vars missing)
 */
export type TestrailType = TestRailClient | null;
