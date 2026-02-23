import { test, expect } from "@framework";

test.describe("ReqRes - Chained Operations (Create → Update → Delete)", () => {
  test("chained operations: create user, then update, then delete @api @chained @smoke", async ({
    envConfig,
    td,
  }) => {
    // Step 1: Create a new user
    const createResponse = await fetch(`${envConfig.apiUrl}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(td.userToCreate),
    });

    expect(createResponse.status).toBe(td.expectedCreateStatus);
    const createdUser = await createResponse.json();
    const userId = createdUser.id;

    expect(userId).toBeDefined();
    expect(createdUser.name).toBe(td.userToCreate.name);
    expect(createdUser.job).toBe(td.userToCreate.job);

    // Step 2: Update the created user
    const updateResponse = await fetch(`${envConfig.apiUrl}/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(td.userToUpdate),
    });

    expect(updateResponse.status).toBe(td.expectedUpdateStatus);
    const updatedUser = await updateResponse.json();

    expect(updatedUser.name).toBe(td.userToUpdate.name);
    expect(updatedUser.job).toBe(td.userToUpdate.job);
    expect(updatedUser.id).toBe(userId);

    // Step 3: Delete the updated user
    const deleteResponse = await fetch(`${envConfig.apiUrl}/users/${userId}`, {
      method: "DELETE",
    });

    expect(deleteResponse.status).toBe(td.expectedDeleteStatus);

    // Step 4: Verify the user is deleted (cannot be fetched)
    const getResponse = await fetch(`${envConfig.apiUrl}/users/${userId}`);
    expect(getResponse.status).toBe(404);
  });

  test("chained operations: batch create multiple users then delete all @api @chained", async ({
    envConfig,
  }) => {
    const users = [
      { name: "Alice Test", job: "QA Engineer" },
      { name: "Bob Test", job: "Developer" },
      { name: "Charlie Test", job: "DevOps" },
    ];

    // Step 1: Create all users in parallel
    const createResponses = await Promise.all(
      users.map((user) =>
        fetch(`${envConfig.apiUrl}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user),
        })
      )
    );

    // Verify all creations succeeded
    const createdUsers = [];
    for (let i = 0; i < createResponses.length; i++) {
      expect(createResponses[i].status).toBe(201);
      const data = await createResponses[i].json();
      createdUsers.push(data);
    }

    expect(createdUsers.length).toBe(3);

    // Step 2: Update all created users
    const updateResponses = await Promise.all(
      createdUsers.map((user) =>
        fetch(`${envConfig.apiUrl}/users/${user.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: `${user.name} Updated`, job: "Updated Role" }),
        })
      )
    );

    // Verify all updates succeeded
    for (const response of updateResponses) {
      expect(response.status).toBe(200);
    }

    // Step 3: Delete all users in parallel
    const deleteResponses = await Promise.all(
      createdUsers.map((user) =>
        fetch(`${envConfig.apiUrl}/users/${user.id}`, {
          method: "DELETE",
        })
      )
    );

    // Verify all deletions succeeded
    for (const response of deleteResponses) {
      expect(response.status).toBe(204);
    }

    // Step 4: Verify all users are deleted
    const getResponses = await Promise.all(
      createdUsers.map((user) => fetch(`${envConfig.apiUrl}/users/${user.id}`))
    );

    for (const response of getResponses) {
      expect(response.status).toBe(404);
    }
  });

  test("chained operations: create, update multiple times, then delete @api @chained", async ({
    envConfig,
  }) => {
    // Step 1: Create a user
    const createResponse = await fetch(`${envConfig.apiUrl}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Initial User", job: "Initial Job" }),
    });

    expect(createResponse.status).toBe(201);
    const createdUser = await createResponse.json();
    const userId = createdUser.id;

    // Step 2: Update the user multiple times
    const updates = [
      { name: "First Update", job: "First Job" },
      { name: "Second Update", job: "Second Job" },
      { name: "Third Update", job: "Third Job" },
    ];

    for (const update of updates) {
      const updateResponse = await fetch(`${envConfig.apiUrl}/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      });

      expect(updateResponse.status).toBe(200);
      const updatedUser = await updateResponse.json();
      expect(updatedUser.name).toBe(update.name);
      expect(updatedUser.job).toBe(update.job);
    }

    // Step 3: Verify final state before deletion
    const getBeforeDeleteResponse = await fetch(`${envConfig.apiUrl}/users/${userId}`);
    // Note: ReqRes doesn't actually persist, so this will return 404
    // In a real API, this would verify the final state

    // Step 4: Delete the user
    const deleteResponse = await fetch(`${envConfig.apiUrl}/users/${userId}`, {
      method: "DELETE",
    });

    expect(deleteResponse.status).toBe(204);
  });

  test("chained operations with error handling: create valid, then try invalid update @api @chained", async ({
    envConfig,
  }) => {
    // Step 1: Create a valid user
    const createResponse = await fetch(`${envConfig.apiUrl}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Error Test User", job: "QA" }),
    });

    expect(createResponse.status).toBe(201);
    const createdUser = await createResponse.json();
    const userId = createdUser.id;

    // Step 2: Try to update the user (this will succeed in ReqRes, but demonstrates the pattern)
    const updateResponse = await fetch(`${envConfig.apiUrl}/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "", job: "Empty Name Job" }),
    });

    // ReqRes accepts empty names
    expect(updateResponse.status).toBe(200);

    // Step 3: Delete the user
    const deleteResponse = await fetch(`${envConfig.apiUrl}/users/${userId}`, {
      method: "DELETE",
    });

    expect(deleteResponse.status).toBe(204);
  });
});
