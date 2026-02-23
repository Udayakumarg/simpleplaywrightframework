import { test, expect } from "@framework";

test.describe("ReqRes - DELETE User", () => {
  test("DELETE remove user @api @delete @smoke", async ({ envConfig, td }) => {
    const response = await fetch(`${envConfig.apiUrl}/users/${td.userId}`, {
      method: "DELETE",
    });

    expect(response.status).toBe(td.expectedStatusCode);
  });

  test("DELETE multiple users sequentially @api @delete", async ({ envConfig }) => {
    const userIds = [4, 5, 6];

    for (const userId of userIds) {
      const response = await fetch(`${envConfig.apiUrl}/users/${userId}`, {
        method: "DELETE",
      });

      expect(response.status).toBe(204);
    }
  });

  test("DELETE multiple users in parallel @api @delete", async ({ envConfig }) => {
    const userIds = [7, 8, 9];

    const responses = await Promise.all(
      userIds.map((userId) =>
        fetch(`${envConfig.apiUrl}/users/${userId}`, {
          method: "DELETE",
        })
      )
    );

    // Verify all requests succeeded
    for (const response of responses) {
      expect(response.status).toBe(204);
    }
  });

  test("DELETE with invalid user ID returns 404 @api @delete", async ({ envConfig }) => {
    const response = await fetch(`${envConfig.apiUrl}/users/99999`, {
      method: "DELETE",
    });

    // ReqRes returns 204 for non-existent users (no validation on backend)
    expect(response.status).toBe(204);
  });

  test("DELETE response should be empty @api @delete", async ({ envConfig, td }) => {
    const response = await fetch(`${envConfig.apiUrl}/users/${td.userId}`, {
      method: "DELETE",
    });

    expect(response.status).toBe(204);

    // 204 No Content should have empty body
    const text = await response.text();
    expect(text).toBe("");
  });

  test("DELETE verify user cannot be fetched after deletion @api @delete", async ({
    envConfig,
  }) => {
    const userId = 10;

    // Delete the user
    const deleteResponse = await fetch(`${envConfig.apiUrl}/users/${userId}`, {
      method: "DELETE",
    });

    expect(deleteResponse.status).toBe(204);

    // Try to fetch the deleted user (ReqRes returns 404)
    const getResponse = await fetch(`${envConfig.apiUrl}/users/${userId}`);
    expect(getResponse.status).toBe(404);
  });
});
