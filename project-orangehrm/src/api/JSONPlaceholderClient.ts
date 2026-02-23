import { BaseAPIClient } from "./BaseAPIClient";

/**
 * JSONPlaceholder API Client
 * Provides methods for testing CRUD operations against JSONPlaceholder
 * JSONPlaceholder: https://jsonplaceholder.typicode.com
 */
export class JSONPlaceholderClient extends BaseAPIClient {
  constructor() {
    super("https://jsonplaceholder.typicode.com");
  }

  /**
   * Get all posts
   */
  async getPosts(limit?: number): Promise<any[]> {
    console.log(`[API:JSONPlaceholder] Getting posts`);
    let endpoint = "/posts";
    if (limit) {
      endpoint += `?_limit=${limit}`;
    }
    return await this.get(endpoint);
  }

  /**
   * Get single post by ID
   */
  async getPost(id: number): Promise<any> {
    console.log(`[API:JSONPlaceholder] Getting post ${id}`);
    return await this.get(`/posts/${id}`);
  }

  /**
   * Create new post
   */
  async createPost(title: string, body: string, userId: number): Promise<any> {
    console.log(`[API:JSONPlaceholder] Creating post: ${title}`);
    return await this.post("/posts", { title, body, userId });
  }

  /**
   * Update post
   */
  async updatePost(id: number, title: string, body: string): Promise<any> {
    console.log(`[API:JSONPlaceholder] Updating post ${id}`);
    return await this.put(`/posts/${id}`, { title, body });
  }

  /**
   * Delete post
   */
  async deletePost(id: number): Promise<any> {
    console.log(`[API:JSONPlaceholder] Deleting post ${id}`);
    return await this.delete(`/posts/${id}`);
  }

  /**
   * Get all users
   */
  async getUsers(): Promise<any[]> {
    console.log(`[API:JSONPlaceholder] Getting users`);
    return await this.get("/users");
  }

  /**
   * Get single user by ID
   */
  async getUser(id: number): Promise<any> {
    console.log(`[API:JSONPlaceholder] Getting user ${id}`);
    return await this.get(`/users/${id}`);
  }

  /**
   * Get comments for a post
   */
  async getPostComments(postId: number): Promise<any[]> {
    console.log(`[API:JSONPlaceholder] Getting comments for post ${postId}`);
    return await this.get(`/posts/${postId}/comments`);
  }

  /**
   * Get todos for a user
   */
  async getUserTodos(userId: number): Promise<any[]> {
    console.log(`[API:JSONPlaceholder] Getting todos for user ${userId}`);
    return await this.get(`/users/${userId}/todos`);
  }
}
