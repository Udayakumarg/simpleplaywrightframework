// framework/src/utils/testrail.client.ts
import fetch from "node-fetch";

// framework/src/utils/testrail.client.ts
export class TestRailClient {
  private baseUrl: string;
  private authHeader: string;

  constructor(baseUrl?: string, username?: string, apiKey?: string) {
    this.baseUrl = baseUrl || "";
    this.authHeader = username && apiKey
      ? "Basic " + Buffer.from(`${username}:${apiKey}`).toString("base64")
      : "";
  }

  async addResult(caseId: number, statusId: number, comment: string) {
    if (!this.baseUrl) {
      console.warn(`⚠️ Demo mode: would push result to TestRail case ${caseId} → status ${statusId}, comment: ${comment}`);
      return { demo: true };
    }

    const url = `${this.baseUrl}/index.php?/api/v2/add_result_for_case/${caseId}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": this.authHeader,
      },
      body: JSON.stringify({ status_id: statusId, comment }),
    });
    return response.json();
  }
}
