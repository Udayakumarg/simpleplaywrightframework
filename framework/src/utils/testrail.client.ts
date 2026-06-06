import { request as playwrightRequest, APIRequestContext } from "@playwright/test";
import { log } from "../logger";

export class TestRailClient {
  private baseUrl: string;
  private authHeader: string;
  private apiPromise?: Promise<APIRequestContext>;

  constructor(baseUrl?: string, username?: string, apiKey?: string) {
    this.baseUrl = (baseUrl || "").replace(/\/+$/, "");
    this.authHeader =
      username && apiKey
        ? "Basic " + Buffer.from(`${username}:${apiKey}`).toString("base64")
        : "";
  }

  private api(): Promise<APIRequestContext> {
    if (!this.apiPromise) this.apiPromise = playwrightRequest.newContext();
    return this.apiPromise;
  }

  /**
   * Push a result for a TestRail case.
   * In demo mode (no baseUrl), the call is logged instead of made — useful
   * for keeping integration shape without needing a live TestRail.
   */
  async addResult(caseId: number, statusId: number, comment: string) {
    if (!this.baseUrl) {
      log.warn(`demo mode: would push case=${caseId} status=${statusId} comment="${comment}"`);
      return { demo: true };
    }

    const ctx = await this.api();
    const res = await ctx.post(
      `${this.baseUrl}/index.php?/api/v2/add_result_for_case/${caseId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.authHeader,
        },
        data: { status_id: statusId, comment },
      }
    );
    return res.json();
  }

  async dispose() {
    if (this.apiPromise) {
      const ctx = await this.apiPromise;
      await ctx.dispose();
    }
  }
}
