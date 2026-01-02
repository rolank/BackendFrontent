import { redirect } from "react-router-dom";
import { API_BASE_URL } from "../config/api.js";
import { getAuthHeaders, isAuthenticated } from "../utils/auth.js";

/**
 * Action for creating a new post
 */
export async function createPostAction({ request }) {
  if (!isAuthenticated()) {
    return { error: "You must be logged in to create a post" };
  }

  if (request.method !== "POST") {
    throw new Error("Invalid request method");
  }

  const formData = await request.formData();
  const title = formData.get("title");
  const content = formData.get("content");

  if (!title || !content) {
    return { error: "Title and content are required" };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ title, contents, author }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create post");
    }

    const post = await response.json();
    // Redirect to home page after successful creation
    return redirect("/");
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Action for updating an existing post
 */
export async function updatePostAction({ request, params }) {
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
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ title, contents, author }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update post");
    }

    const post = await response.json();
    return redirect(`/posts/${post._id || post.id}`);
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Action for deleting a post
 */
export async function deletePostAction({ params }) {
  if (!isAuthenticated()) {
    return { error: "You must be logged in to delete a post" };
  }

  const { postId } = params;

  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete post");
    }

    // Redirect to home page after successful deletion
    return redirect("/");
  } catch (error) {
    return { error: error.message };
  }
}
