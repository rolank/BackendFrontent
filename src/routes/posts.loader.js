import { API_BASE_URL } from "../config/api.js";
import { getAuthHeaders } from "../utils/auth.js";

/**
 * Loader for blog home page
 * Fetches posts with optional filtering and sorting
 */
export async function postsLoader({ request }) {
  const url = new URL(request.url);
  const author = url.searchParams.get("author") || "";
  const sortBy = url.searchParams.get("sortBy") || "createdAt";
  const sortOrder = url.searchParams.get("sortOrder") || "descending";

  try {
    const response = await fetch(
      `${API_BASE_URL}/posts?author=${author}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch posts");
    }

    const posts = await response.json();
    return { posts, filters: { author, sortBy, sortOrder } };
  } catch (error) {
    throw new Error(`Failed to load posts: ${error.message}`);
  }
}

/**
 * Loader for single post view
 */
export async function postLoader({ params }) {
  const { postId } = params;

  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Post not found");
    }

    const post = await response.json();
    return { post };
  } catch (error) {
    throw new Error(`Failed to load post: ${error.message}`);
  }
}
