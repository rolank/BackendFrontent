import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getPosts, createPost } from "./posts";

describe("Posts API", () => {
  // Save original fetch
  const originalFetch = global.fetch;

  beforeEach(() => {
    // Mock fetch before each test
    global.fetch = vi.fn();
  });

  afterEach(() => {
    // Restore original fetch after each test
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe("getPosts", () => {
    it("fetches posts successfully with query parameters", async () => {
      const mockPosts = [
        { _id: "1", title: "First Post", author: "alice" },
        { _id: "2", title: "Second Post", author: "bob" },
      ];

      // Mock successful fetch response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPosts,
      });

      const queryParams = { author: "alice", sortBy: "createdAt" };
      const posts = await getPosts(queryParams);

      // Verify fetch was called with correct URL
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("author=alice"),
        expect.objectContaining({
          headers: expect.any(Object),
        }),
      );

      // Verify returned data
      expect(posts).toEqual(mockPosts);
      expect(posts).toHaveLength(2);
    });

    it("fetches posts without query parameters", async () => {
      const mockPosts = [{ _id: "1", title: "Post" }];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPosts,
      });

      const posts = await getPosts({});

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(posts).toEqual(mockPosts);
    });

    it("throws error when fetch fails", async () => {
      // Mock failed fetch response
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      // Verify error is thrown
      await expect(getPosts({})).rejects.toThrow("Failed to fetch posts");
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it("throws error when network request fails", async () => {
      // Mock network error
      global.fetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(getPosts({})).rejects.toThrow("Network error");
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("createPost", () => {
    it("creates a post successfully", async () => {
      const newPost = {
        title: "New Post",
        contents: "This is a new post",
        author: "charlie",
      };

      const mockResponse = {
        _id: "123",
        ...newPost,
        createdAt: "2026-01-05T12:00:00Z",
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await createPost(newPost);

      // Verify fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/posts"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "content-Type": "application/json",
          }),
          body: JSON.stringify(newPost),
        }),
      );

      // Verify returned data
      expect(result).toEqual(mockResponse);
      expect(result._id).toBe("123");
    });

    it("throws error when post creation fails", async () => {
      const newPost = {
        title: "Bad Post",
        contents: "This will fail",
      };

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
      });

      await expect(createPost(newPost)).rejects.toThrow(
        "Failed to create post",
      );
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it("handles validation errors from server", async () => {
      const invalidPost = { title: "" }; // Missing required fields

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        statusText: "Unprocessable Entity",
      });

      await expect(createPost(invalidPost)).rejects.toThrow(
        "Failed to create post",
      );
    });
  });

  describe("Mock verification examples", () => {
    it("demonstrates mock call inspection", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      await getPosts({ author: "alice", sortBy: "title" });

      // Get the actual call arguments
      const callArgs = global.fetch.mock.calls[0];
      const [url, options] = callArgs;

      // Inspect what was called
      expect(url).toContain("author=alice");
      expect(url).toContain("sortBy=title");
      expect(options.headers).toBeDefined();
    });

    it("demonstrates multiple mock calls", async () => {
      // Mock multiple sequential responses
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [{ _id: "1" }],
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [{ _id: "2" }],
        });

      const posts1 = await getPosts({ author: "alice" });
      const posts2 = await getPosts({ author: "bob" });

      expect(posts1[0]._id).toBe("1");
      expect(posts2[0]._id).toBe("2");
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it("demonstrates spy on console.log", async () => {
      const consoleSpy = vi.spyOn(console, "log");

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ _id: "123" }),
      });

      const post = { title: "Test" };
      await createPost(post);

      // Verify console.log was called with correct message
      expect(consoleSpy).toHaveBeenCalledWith("Creating post:", post);

      consoleSpy.mockRestore();
    });
  });
});
