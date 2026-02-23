import { test, expect } from "@framework";

test.describe("ReqRes - POST Create User", () => {
  test("POST create new user @api @post @smoke", async ({ envConfig, td }) => {
    const response = await fetch(`${envConfig.apiUrl}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(td.user),
    });

    expect(response.status).toBe(td.expectedStatusCode);

    const data = await response.json();

    // Verify response contains created user data
    expect(data).toHaveProperty("id");
    expect(data).toHaveProperty("createdAt");
    expect(data.name).toBe(td.user.name);
    expect(data.job).toBe(td.user.job);
  });

  test("POST create user with multiple jobs @api @post", async ({ envConfig }) => {
    const user1 = { name: "Alice", job: "QA Engineer" };
    const user2 = { name: "Bob", job: "Developer" };
    const user3 = { name: "Charlie", job: "DevOps Engineer" };

    const responses = await Promise.all([
      fetch(`${envConfig.apiUrl}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user1),
      }),
      fetch(`${envConfig.apiUrl}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user2),
      }),
      fetch(`${envConfig.apiUrl}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user3),
      }),
    ]);

    // Verify all requests succeeded
    for (const response of responses) {
      expect(response.status).toBe(201);
    }

    // Verify data
    const data1 = await responses[0].json();
    const data2 = await responses[1].json();
    const data3 = await responses[2].json();

    expect(data1.name).toBe("Alice");
    expect(data2.name).toBe("Bob");
    expect(data3.name).toBe("Charlie");
  });

  test("POST create user with empty name @api @post", async ({ envConfig }) => {
    const user = { name: "", job: "QA Engineer" };

    const response = await fetch(`${envConfig.apiUrl}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });

    // ReqRes still returns 201 for empty names (validation not enforced)
    expect(response.status).toBe(201);

    const data = await response.json();
    expect(data.name).toBe("");
  });

  test("POST create user with special characters in name @api @post", async ({
    envConfig,
  }) => {
    const user = { name: "Test User @#$% 123", job: "QA Engineer" };

    const response = await fetch(`${envConfig.apiUrl}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });

    expect(response.status).toBe(201);

    const data = await response.json();
    expect(data.name).toBe("Test User @#$% 123");
    expect(data.job).toBe("QA Engineer");
  });

  test("POST verify response contains timestamp @api @post", async ({ envConfig, td }) => {
    const response = await fetch(`${envConfig.apiUrl}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(td.user),
    });

    expect(response.status).toBe(201);

    const data = await response.json();

    // Verify createdAt is ISO 8601 format
    expect(data.createdAt).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });
});
