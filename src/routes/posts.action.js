import { redirect } from "react-router-dom";
import { API_BASE_URL } from "../config/api.js";
import { getAuthHeaders, isAuthenticated } from "../utils/auth.js";

/**
 * Action for creating a new post with React Query cache invalidation
 */
export function createPostAction(queryClient) {
  return async ({ request }) => {
    if (!isAuthenticated()) {
      return { error: "You must be logged in to create a post" };
    }

    if (request.method !== "POST") {
      throw new Error("Invalid request method");
    }

    const formData = await request.formData();
    const title = formData.get("title");
    const contents = formData.get("contents");
    const author = formData.get("author");

    if (!title || !contents || !author) {
      return { error: "Title, author, and contents are required" };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(), // Attach JWT Authorization header if present
        },
        body: JSON.stringify({ title, contents, author }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create post");
      }

      const post = await response.json();

      // Invalidate posts cache to refetch list
      await queryClient.invalidateQueries({ queryKey: ["posts"] });

      // Redirect to home page after successful creation
      return redirect("/");
    } catch (error) {
      return { error: error.message };
    }
  };
}

/**
 * Action for updating an existing post with React Query cache update
 */
export function updatePostAction(queryClient) {
  return async ({ request, params }) => {
    if (!isAuthenticated()) {
      return { error: "You must be logged in to update a post" };
    }

    if (request.method !== "PATCH") {
      throw new Error("Invalid request method");
    }

    const { postId } = params;
    const formData = await request.formData();
    const title = formData.get("title");
    const contents = formData.get("contents");
    const author = formData.get("author");

    if (!title || !contents || !author) {
      return { error: "Title, author, and contents are required" };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(), // Attach JWT Authorization header if present
        },
        body: JSON.stringify({ title, contents, author }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update post");
      }

      const post = await response.json();

      // Invalidate both the single post and posts list cache
      await queryClient.invalidateQueries({ queryKey: ["post", postId] });
      await queryClient.invalidateQueries({ queryKey: ["posts"] });

      return redirect(`/posts/${post._id || post.id}`);
    } catch (error) {
      return { error: error.message };
    }
  };
}

/**
 * Action for deleting a post with React Query cache removal
 */
export function deletePostAction(queryClient) {
  return async ({ params }) => {
    if (!isAuthenticated()) {
      return { error: "You must be logged in to delete a post" };
    }

    const { postId } = params;

    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(), // Attach JWT Authorization header if present
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete post");
      }

      // Remove the post from cache and invalidate posts list
      queryClient.removeQueries({ queryKey: ["post", postId] });
      await queryClient.invalidateQueries({ queryKey: ["posts"] });

      // Redirect to home page after successful deletion
      return redirect("/");
    } catch (error) {
      return { error: error.message };
    }
  };
}
