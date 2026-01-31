import { useLoaderData, Link, Form, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../utils/auth.js";
import { API_BASE_URL } from "../config/api.js";
import "./SinglePostPage.css";

export function SinglePostPage() {
  // Read initial data provided by the route loader.
  const loaderData = useLoaderData();
  // Read the post id from the URL params.
  const { postId } = useParams();
  // Get the currently authenticated user (if any).
  const currentUser = getCurrentUser();

  // Use React Query with loader data as initialData
  const { data } = useQuery({
    // Cache key scoped to the current post id.
    queryKey: ["post", postId],
    // Fetch the latest post from the API.
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Post not found");
      return response.json();
    },
    initialData: loaderData.post,
    staleTime: 1000 * 60 * 5,
  });

  // Normalize the post object for rendering.
  const post = data || loaderData.post;
  // Only the author can edit or delete the post.
  const isOwner = currentUser && currentUser.username === post.author;

  return (
    <div className="single-post-container">
      <Link to="/" className="single-post-back-link">
        ← Back to Blog
      </Link>
      <article className="single-post-article">
        <h1 className="single-post-title">{post.title}</h1>
        <p className="single-post-meta">
          {/* Author is returned as username (resolved on the backend) */}
          By {post.author} • {new Date(post.createdAt).toLocaleDateString()}
          {post.updatedAt !== post.createdAt && " (edited)"}
        </p>
        <div className="single-post-content">{post.contents}</div>
        {isOwner && (
          // Author-only actions (edit/delete)
          <div className="single-post-actions">
            <Link
              to={`/posts/${post._id || post.id}/edit`}
              className="single-post-edit-button"
            >
              Edit
            </Link>
            <Form method="delete" className="single-post-delete-form">
              <button
                type="submit"
                className="single-post-delete-button"
                onClick={(e) => {
                  if (!confirm("Are you sure you want to delete this post?")) {
                    e.preventDefault();
                  }
                }}
              >
                Delete
              </button>
            </Form>
          </div>
        )}
      </article>
    </div>
  );
}
