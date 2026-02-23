import { test, expect } from "@framework";

test.describe("ReqRes - PUT Update User", () => {
  test("PUT update existing user @api @put @smoke", async ({ envConfig, td }) => {
    const response = await fetch(`${envConfig.apiUrl}/users/${td.userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(td.updatedUser),
    });

    expect(response.status).toBe(td.expectedStatusCode);

    const data = await response.json();

    // Verify response contains updated user data
    expect(data.name).toBe(td.updatedUser.name);
    expect(data.job).toBe(td.updatedUser.job);
    expect(data).toHaveProperty("updatedAt");
  });

  test("PUT update user with partial data @api @put", async ({ envConfig }) => {
    const updateData = { job: "Manager" };

    const response = await fetch(`${envConfig.apiUrl}/users/3`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.job).toBe("Manager");
  });

  test("PUT update multiple users @api @put", async ({ envConfig }) => {
    const updates = [
      { userId: 1, data: { name: "User 1 Updated", job: "Lead" } },
      { userId: 2, data: { name: "User 2 Updated", job: "Senior" } },
      { userId: 3, data: { name: "User 3 Updated", job: "Manager" } },
    ];

    const responses = await Promise.all(
      updates.map((update) =>
        fetch(`${envConfig.apiUrl}/users/${update.userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(update.data),
        })
      )
    );

    // Verify all requests succeeded
    for (const response of responses) {
      expect(response.status).toBe(200);
    }

    // Verify data
    const data0 = await responses[0].json();
    const data1 = await responses[1].json();
    const data2 = await responses[2].json();

    expect(data0.name).toBe("User 1 Updated");
    expect(data1.name).toBe("User 2 Updated");
    expect(data2.name).toBe("User 3 Updated");
  });

  test("PUT update non-existent user @api @put", async ({ envConfig }) => {
    const response = await fetch(`${envConfig.apiUrl}/users/99999`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test", job: "Test" }),
    });

    // ReqRes returns 200 even for non-existent users (no validation on backend)
    expect(response.status).toBe(200);
  });

  test("PUT update user with empty name @api @put", async ({ envConfig }) => {
    const response = await fetch(`${envConfig.apiUrl}/users/2`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "", job: "QA Lead" }),
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.name).toBe("");
  });

  test("PUT verify response contains updatedAt timestamp @api @put", async ({
    envConfig,
    td,
  }) => {
    const response = await fetch(`${envConfig.apiUrl}/users/${td.userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(td.updatedUser),
    });

    expect(response.status).toBe(200);

    const data = await response.json();

    // Verify updatedAt is ISO 8601 format
    expect(data.updatedAt).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  test("PATCH partially update user @api @patch", async ({ envConfig }) => {
    const response = await fetch(`${envConfig.apiUrl}/users/2`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Patched Name" }),
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.name).toBe("Patched Name");
  });
});
