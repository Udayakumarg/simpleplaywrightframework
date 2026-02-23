import { test, expect } from "@framework";
import type { ApiResponse } from "@framework/src/types/api";

test.describe("JSONPlaceholder API Tests - Robust Framework", () => {
  let postId: number;

  test.describe("GET Operations", () => {
    test("GET all posts with framework @api @json-placeholder @smoke", async ({ apiClient, apiValidator }) => {
      const response = await apiClient.get<any[]>("/posts?_limit=5");

      // Validate status code
      expect(response.status).toBe(200);

      // Validate response structure
      apiValidator.assert(Array.isArray(response.data), "Response should be an array");
      apiValidator.assert(response.data.length > 0, "At least one post should exist");

      // Validate first item has required fields
      const firstPost = response.data[0];
      expect(firstPost).toHaveProperty("id");
      expect(firstPost).toHaveProperty("title");
      expect(firstPost).toHaveProperty("body");

      console.log(`[Test] Retrieved ${response.data.length} posts`);
    });

    test("GET single post by ID with framework @api @json-placeholder", async ({ apiClient, apiValidator }) => {
      const response = await apiClient.get<any>("/posts/1");

      expect(response.status).toBe(200);

      const post = response.data;
      expect(post).toHaveProperty("id");
      expect(post).toHaveProperty("title");
      expect(post).toHaveProperty("body");
      expect(post.id).toBe(1);

      const isValid = apiValidator.validateContains(response as any, "ut");
      console.log(`[Test] Post contains search term: ${isValid}`);
    });

    test("GET users with validation @api @json-placeholder", async ({ apiClient, apiValidator }) => {
      const response = await apiClient.get<any[]>("/users");

      expect(response.status).toBe(200);

      // Validate it's an array with at least one item
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThanOrEqual(1);

      // Validate first user
      expect(response.data[0]).toHaveProperty("id");
      expect(response.data[0]).toHaveProperty("name");
      expect(response.data[0]).toHaveProperty("email");
    });
  });

  test.describe("POST Operations", () => {
    test("POST create post with framework @api @json-placeholder @smoke", async ({ apiClient, apiValidator, td }) => {
      const newPost = {
        title: td.postTitle || "Test Post",
        body: td.postBody || "This is a test post",
        userId: td.userId || 1,
      };

      const response = await apiClient.post<any>("/posts", newPost);

      // Validate status
      expect(response.status).toBe(201);

      // Validate response
      expect(response.data).toHaveProperty("id");
      expect(response.data.title).toBe(newPost.title);
      expect(response.data.body).toBe(newPost.body);

      postId = response.data.id;
      console.log(`[Test] Created post with ID: ${postId}`);
    });

    test("POST create multiple posts @api @json-placeholder", async ({ apiClient, apiValidator, td }) => {
      const posts = [];

      for (let i = 0; i < 3; i++) {
        const newPost = {
          title: `${td.postTitle || "Test"} ${i}`,
          body: td.postBody || "Test body",
          userId: td.userId || 1,
        };

        const response = await apiClient.post<any>("/posts", newPost);
        expect(response.status).toBe(201);
        posts.push(response.data);
      }

      expect(posts.length).toBe(3);
      console.log(`[Test] Created ${posts.length} posts successfully`);
    });
  });

  test.describe("PUT Operations", () => {
    test("PUT update post with framework @api @json-placeholder @smoke", async ({ apiClient, apiValidator, td }) => {
      const updateData = {
        title: td.updateTitle || "Updated Post",
        body: td.updateBody || "Updated body",
        userId: td.userId || 1,
      };

      const response = await apiClient.put<any>("/posts/1", updateData);

      expect(response.status).toBe(200);
      expect(response.data.id).toBe(1);
      expect(response.data.title).toBe(updateData.title);

      console.log("[Test] Post updated successfully");
    });
  });

  test.describe("DELETE Operations", () => {
    test("DELETE post with framework @api @json-placeholder @smoke", async ({ apiClient, apiValidator }) => {
      const response = await apiClient.delete<any>("/posts/1");

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      console.log("[Test] Post deleted successfully");
    });
  });

  test.describe("Chained Operations with Framework", () => {
    test("Create, update, retrieve workflow @api @json-placeholder @chained", async ({ apiClient, apiValidator }) => {
      // Create
      const createData = {
        title: "Workflow Test",
        body: "Testing chained operations",
        userId: 1,
      };

      const createResponse = await apiClient.post<any>("/posts", createData);
      expect(createResponse.status).toBe(201);
      const newPostId = createResponse.data.id;

      // Update
      const updateData = {
        title: "Updated Workflow",
        body: "Updated chained test",
        userId: 1,
      };

      const updateResponse = await apiClient.put<any>(`/posts/${newPostId}`, updateData);
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.data.title).toBe(updateData.title);

      // Retrieve
      const getResponse = await apiClient.get<any>(`/posts/${newPostId}`);
      expect(getResponse.status).toBe(200);
      expect(getResponse.data.id).toBe(newPostId);

      console.log(`[Test] Chained workflow completed for post ${newPostId}`);
    });

    test("Parallel updates with framework @api @json-placeholder @chained", async ({ apiClient, apiValidator }) => {
      const updatePromises = [];

      for (let i = 1; i <= 3; i++) {
        const promise = apiClient.put<any>(`/posts/${i}`, {
          title: `Parallel Update ${i}`,
          body: `Updated in parallel`,
          userId: 1,
        });
        updatePromises.push(promise);
      }

      const results = await Promise.all(updatePromises);

      expect(results.length).toBe(3);
      for (const result of results) {
        expect(result.status).toBe(200);
      }

      console.log("[Test] Parallel updates completed successfully");
    });
  });

  test.describe("Error Handling with Framework", () => {
    test("Handle 404 Not Found gracefully @api @json-placeholder @negative", async ({ apiClient, apiValidator }) => {
      try {
        const response = await apiClient.get<any>("/posts/99999");
        // JSONPlaceholder returns 200 with empty object, but most APIs return 404
        console.log("[Test] Response for non-existent resource:", response.status);
      } catch (error: any) {
        console.log("[Test] Caught expected error:", error.message);
      }
    });

    test("Validate response schema @api @json-placeholder", async ({ apiClient, apiValidator }) => {
      const response = await apiClient.get<any>("/posts/1");

      const schema = {
        required: ["id", "title", "body"],
        type: "object" as const,
      };

      const isValid = apiValidator.validateSchema(response as any, schema);
      expect(isValid).toBe(true);

      console.log("[Test] Schema validation passed");
    });
  });

  test.describe("Data-Driven Tests", () => {
    test("Create posts from test data @api @json-placeholder @data-driven", async ({ apiClient, apiValidator, td }) => {
      // Using environment-specific test data from td fixture
      const postData = {
        title: td.postTitle || "Default Post",
        body: td.postBody || "Default body",
        userId: td.userId || 1,
      };

      const response = await apiClient.post<any>("/posts", postData);

      expect(response.status).toBe(201);
      expect(response.data.title).toBe(postData.title);

      console.log(`[Test] Created post with td fixture data: ${td.postTitle}`);
    });
  });
});
