import { test, expect } from "@framework";

test.describe("ReqRes - GET Users", () => {
  test("GET request to fetch all users @api @get", async ({ envConfig, td }) => {
    const response = await fetch(`${envConfig.apiUrl}/users?page=${td.pageParam}`);

    expect(response.status).toBe(200);

    const data = await response.json();

    // Verify response structure
    expect(data).toHaveProperty("page");
    expect(data).toHaveProperty("data");
    expect(data).toHaveProperty("per_page");
    expect(data).toHaveProperty("total");
    expect(data).toHaveProperty("total_pages");

    // Verify data matches expected values
    expect(data.page).toBe(td.expectedPage);
    expect(data.per_page).toBe(td.expectedPerPage);
    expect(data.total).toBe(td.expectedTotal);

    // Verify users array is not empty
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBeGreaterThan(0);

    // Verify user object structure
    const user = data.data[0];
    expect(user).toHaveProperty("id");
    expect(user).toHaveProperty("email");
    expect(user).toHaveProperty("first_name");
    expect(user).toHaveProperty("last_name");
    expect(user).toHaveProperty("avatar");
  });

  test("GET single user by ID @api @get", async ({ envConfig }) => {
    const userId = 1;
    const response = await fetch(`${envConfig.apiUrl}/users/${userId}`);

    expect(response.status).toBe(200);

    const data = await response.json();

    // Verify response structure
    expect(data).toHaveProperty("data");
    expect(data).toHaveProperty("support");

    // Verify user data
    const user = data.data;
    expect(user.id).toBe(userId);
    expect(user).toHaveProperty("email");
    expect(user).toHaveProperty("first_name");
    expect(user).toHaveProperty("last_name");
  });

  test("GET with pagination @api @get", async ({ envConfig }) => {
    const response1 = await fetch(`${envConfig.apiUrl}/users?page=1`);
    const data1 = await response1.json();

    const response2 = await fetch(`${envConfig.apiUrl}/users?page=2`);
    const data2 = await response2.json();

    // Verify both pages have data
    expect(data1.data.length).toBeGreaterThan(0);
    expect(data2.data.length).toBeGreaterThan(0);

    // Verify pages are different
    expect(data1.page).toBe(1);
    expect(data2.page).toBe(2);

    // Verify users are different between pages
    expect(data1.data[0].id).not.toBe(data2.data[0].id);
  });

  test("GET non-existent user returns 404 @api @get", async ({ envConfig }) => {
    const response = await fetch(`${envConfig.apiUrl}/users/99999`);

    expect(response.status).toBe(404);
  });
});
