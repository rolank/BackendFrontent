import {
  describe,
  expect,
  test,
  beforeEach,
  beforeAll,
  afterAll,
} from "@jest/globals";
import mongoose from "mongoose";
import { Post } from "../db/models/post.js";
import { User } from "../db/models/user.js";
import { createUser, loginUser, findByUserName } from "../services/users.js";
import axios from "axios";

/* IMPORTANT: Integration Tests for HTTP API Endpoints
 *
 * These tests make HTTP requests to a running Express server (http://localhost:8080).
 * They test the full API layer including:
 * - HTTP status codes and response formats
 * - Authentication tokens and JWT verification
 * - Request/response handling through the Express middleware stack
 *
 * UNLIKE posts.test.js (which uses an in-memory MongoDB via MongoMemoryServer),
 * these integration tests use the REAL DATABASE configured for NODE_ENV=development.
 *
 * WHY? The tests are external HTTP clients making requests to a running server.
 * They cannot inject an in-memory database into the server process. The server
 * connects to its own database based on environment configuration.
 *
 * TO RUN THESE TESTS:
 * 1. Start the server: npm run dev (in one terminal)
 * 2. Run tests: npm test -- endpoints.integration.test.js (in another terminal)
 */

// Test configuration
const API_BASE_URL = "http://localhost:8080/api/v1";
let authToken = null;
let testUser = null;
let testUserId = null;
let testPost = null;

// Helper function to make API requests
const api = axios.create({
  baseURL: API_BASE_URL,
  validateStatus: () => true, // Don't throw on any status code
});

// Helper to add auth token to requests
const apiWithAuth = (token) => {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    validateStatus: () => true,
  });
};

beforeAll(async () => {
  console.log("Starting API tests...");
  console.log("Waiting for server to be ready...");

  // Wait for server to be ready
  let serverReady = false;
  let attempts = 0;
  while (!serverReady && attempts < 10) {
    try {
      const response = await api.get("/");
      if (response.status === 200) {
        serverReady = true;
      }
    } catch (err) {
      attempts++;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  if (!serverReady) {
    throw new Error("Server is not ready after 10 seconds");
  }

  console.log("Server is ready!");

  // Create a test user
  const signupResponse = await api.post("/user/signup", {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: "TestPassword123",
  });

  if (signupResponse.status === 201) {
    testUser = signupResponse.data;
    testUserId = testUser._id;
    console.log("Test user created:", testUser.username);
  }

  // Login to get auth token
  const loginResponse = await api.post("/user/login", {
    username: testUser.username,
    password: "TestPassword123",
  });

  if (loginResponse.status === 200) {
    authToken = loginResponse.data.token;
    console.log("Auth token obtained");
  }
}, 30000);

afterAll(async () => {
  // Cleanup - delete test user and posts
  if (testUserId) {
    await User.deleteOne({ _id: testUserId });
  }
  if (testPost) {
    await Post.deleteOne({ _id: testPost._id });
  }
  console.log("Cleanup completed");
});

describe("User API", () => {
  describe("POST /user/signup", () => {
    test("should successfully create a new user", async () => {
      const response = await api.post("/user/signup", {
        username: `newuser_${Date.now()}`,
        email: `newuser_${Date.now()}@example.com`,
        password: "SecurePass123",
      });

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty("_id");
      expect(response.data).toHaveProperty("username");
      expect(response.data).toHaveProperty("email");
      expect(response.data).not.toHaveProperty("passwordHash");
    });

    test("should fail with duplicate username", async () => {
      const username = `dupuser_${Date.now()}`;
      const email = `dupuser_${Date.now()}@example.com`;

      // Create first user
      const firstResponse = await api.post("/user/signup", {
        username,
        email,
        password: "Pass123",
      });
      expect(firstResponse.status).toBe(201);

      // Try to create duplicate
      const secondResponse = await api.post("/user/signup", {
        username, // Same username
        email: `different_${Date.now()}@example.com`,
        password: "Pass123",
      });

      expect(secondResponse.status).toBe(400);
      expect(secondResponse.data).toHaveProperty("error");
    });

    test("should fail with missing required fields", async () => {
      const responses = await Promise.all([
        api.post("/user/signup", {
          email: "test@example.com",
          password: "Pass123",
        }), // missing username
        api.post("/user/signup", {
          username: "testuser",
          password: "Pass123",
        }), // missing email
        api.post("/user/signup", {
          username: "testuser",
          email: "test@example.com",
        }), // missing password
      ]);

      responses.forEach((response) => {
        expect(response.status).toBe(400);
      });
    });
  });

  describe("POST /user/login", () => {
    test("should successfully login with correct credentials", async () => {
      const response = await api.post("/user/login", {
        username: testUser.username,
        password: "TestPassword123",
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("token");
      expect(response.data).toHaveProperty("user");
      expect(response.data.user).toHaveProperty("_id");
      expect(response.data.user).not.toHaveProperty("passwordHash");
    });

    test("should fail with incorrect password", async () => {
      const response = await api.post("/user/login", {
        username: testUser.username,
        password: "WrongPassword",
      });

      expect(response.status).toBe(401);
      expect(response.data).toHaveProperty("error");
    });

    test("should fail with nonexistent user", async () => {
      const response = await api.post("/user/login", {
        username: "nonexistentuser_12345",
        password: "SomePassword",
      });

      expect(response.status).toBe(401);
      expect(response.data).toHaveProperty("error");
    });

    test("should return token in proper JWT format", async () => {
      const response = await api.post("/user/login", {
        username: testUser.username,
        password: "TestPassword123",
      });

      expect(response.status).toBe(200);
      const token = response.data.token;
      expect(token).toMatch(
        /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/,
      );
    });
  });

  describe("GET /user/:id", () => {
    test("should retrieve user by username", async () => {
      const response = await api.get(`/user/${testUser.username}`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("username");
      expect(response.data.username).toBe(testUser.username);
      expect(response.data).not.toHaveProperty("passwordHash");
    });

    test("should return 404 for nonexistent user", async () => {
      const response = await api.get("/user/nonexistentuser_xyz");

      expect(response.status).toBe(404);
      expect(response.data).toHaveProperty("error");
    });
  });
});

describe("Posts API", () => {
  describe("GET /posts", () => {
    test("should list all posts", async () => {
      const response = await api.get("/posts");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    test("should support sorting by createdAt ascending", async () => {
      const response = await api.get("/posts", {
        params: {
          sortBy: "createdAt",
          sortOrder: "ascending",
        },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    test("should support sorting by createdAt descending", async () => {
      const response = await api.get("/posts", {
        params: {
          sortBy: "createdAt",
          sortOrder: "descending",
        },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    test("should filter by author", async () => {
      const response = await api.get("/posts", {
        params: {
          author: testUser.username,
        },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    test("should filter by tag", async () => {
      const response = await api.get("/posts", {
        params: {
          tag: "test",
        },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    test("should fail when both author and tag are provided", async () => {
      const response = await api.get("/posts", {
        params: {
          author: testUser.username,
          tag: "test",
        },
      });

      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty("error");
    });
  });

  describe("POST /posts", () => {
    test("should create a new post with authentication", async () => {
      const authenticatedApi = apiWithAuth(authToken);
      const response = await authenticatedApi.post("/posts", {
        title: `Test Post ${Date.now()}`,
        author: testUser.username,
        contents: "This is a test post content",
        tags: ["test", "api"],
      });

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty("_id");
      expect(response.data).toHaveProperty("title");
      expect(response.data).toHaveProperty("author");
      expect(response.data).toHaveProperty("contents");
      testPost = response.data; // Save for later tests
    });

    test("should fail without authentication token", async () => {
      const response = await api.post("/posts", {
        title: "Unauthorized Post",
        author: testUser.username,
        contents: "This should fail",
      });

      expect(response.status).toBe(401);
    });

    test("should fail with missing required fields", async () => {
      const authenticatedApi = apiWithAuth(authToken);
      const responses = await Promise.all([
        authenticatedApi.post("/posts", {
          author: testUser.username,
          contents: "Missing title",
        }),
        authenticatedApi.post("/posts", {
          title: "Missing author",
          contents: "Test content",
        }),
        authenticatedApi.post("/posts", {
          title: "Missing contents",
          author: testUser.username,
        }),
      ]);

      responses.forEach((response) => {
        expect(response.status).toBe(400);
      });
    });

    test("should fail with nonexistent author", async () => {
      const authenticatedApi = apiWithAuth(authToken);
      const response = await authenticatedApi.post("/posts", {
        title: "Invalid Author Post",
        author: "nonexistentuser_xyz",
        contents: "Test content",
      });

      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty("error");
    });
  });

  describe("GET /posts/:id", () => {
    test("should retrieve a specific post by ID", async () => {
      if (!testPost) {
        console.log("Skipping test - no test post created");
        return;
      }

      const response = await api.get(`/posts/${testPost._id}`);

      expect(response.status).toBe(200);
      expect(response.data._id).toBe(testPost._id);
      expect(response.data).toHaveProperty("title");
      expect(response.data).toHaveProperty("author");
    });

    test("should return 404 for nonexistent post", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await api.get(`/posts/${fakeId}`);

      expect(response.status).toBe(404);
    });

    test("should return 400 for invalid post ID", async () => {
      const response = await api.get("/posts/invalid_id");

      expect(response.status).toBe(400);
    });
  });

  describe("PATCH /posts/:id", () => {
    test("should update a post with authentication", async () => {
      if (!testPost) {
        console.log("Skipping test - no test post created");
        return;
      }

      const authenticatedApi = apiWithAuth(authToken);
      const response = await authenticatedApi.patch(`/posts/${testPost._id}`, {
        title: `Updated Post ${Date.now()}`,
        author: testUser.username,
        contents: "Updated content for the post",
        tags: ["updated", "test"],
      });

      expect(response.status).toBe(200);
      expect(response.data._id).toBe(testPost._id);
      expect(response.data.title).toContain("Updated Post");
    });

    test("should fail without authentication token", async () => {
      if (!testPost) {
        console.log("Skipping test - no test post created");
        return;
      }

      const response = await api.patch(`/posts/${testPost._id}`, {
        title: "Unauthorized Update",
        author: testUser.username,
        contents: "This should fail",
      });

      expect(response.status).toBe(401);
    });

    test("should fail with missing required fields", async () => {
      if (!testPost) {
        console.log("Skipping test - no test post created");
        return;
      }

      const authenticatedApi = apiWithAuth(authToken);
      const response = await authenticatedApi.patch(`/posts/${testPost._id}`, {
        title: "Only title",
      });

      expect(response.status).toBe(400);
    });

    test("should return 404 for nonexistent post", async () => {
      const authenticatedApi = apiWithAuth(authToken);
      const fakeId = new mongoose.Types.ObjectId();
      const response = await authenticatedApi.patch(`/posts/${fakeId}`, {
        title: "Updated",
        author: testUser.username,
        contents: "Updated content",
      });

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /posts/:id", () => {
    test("should delete a post with authentication", async () => {
      // First create a post to delete
      const authenticatedApi = apiWithAuth(authToken);
      const createResponse = await authenticatedApi.post("/posts", {
        title: `Post to Delete ${Date.now()}`,
        author: testUser.username,
        contents: "This post will be deleted",
        tags: ["delete-test"],
      });

      if (createResponse.status !== 201) {
        console.log("Skipping delete test - couldn't create post");
        return;
      }

      const postToDelete = createResponse.data;
      const deleteResponse = await authenticatedApi.delete(
        `/posts/${postToDelete._id}`,
      );

      expect(deleteResponse.status).toBe(204);

      // Verify post is deleted
      const verifyResponse = await api.get(`/posts/${postToDelete._id}`);
      expect(verifyResponse.status).toBe(404);
    });

    test("should fail without authentication token", async () => {
      if (!testPost) {
        console.log("Skipping test - no test post created");
        return;
      }

      const response = await api.delete(`/posts/${testPost._id}`);

      expect(response.status).toBe(401);
    });

    test("should return 404 for nonexistent post", async () => {
      const authenticatedApi = apiWithAuth(authToken);
      const fakeId = new mongoose.Types.ObjectId();
      const response = await authenticatedApi.delete(`/posts/${fakeId}`);

      expect(response.status).toBe(404);
    });

    test("should return 400 for invalid post ID", async () => {
      const authenticatedApi = apiWithAuth(authToken);
      const response = await authenticatedApi.delete("/posts/invalid_id");

      expect(response.status).toBe(400);
    });
  });
});
