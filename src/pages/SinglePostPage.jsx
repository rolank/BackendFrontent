import { useLoaderData, Link, Form, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../utils/auth.js";
import { API_BASE_URL } from "../config/api.js";
import "./SinglePostPage.css";

export function SinglePostPage() {
  const loaderData = useLoaderData();
  const { postId } = useParams();
  const currentUser = getCurrentUser();

  // Use React Query with loader data as initialData
  const { data } = useQuery({
    queryKey: ["post", postId],
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

  const post = data || loaderData.post;
  const isOwner = currentUser && currentUser.username === post.author;

  return (
    <div className="single-post-container">
      <Link to="/" className="single-post-back-link">
        ← Back to Blog
      </Link>
      <article className="single-post-article">
        <h1 className="single-post-title">{post.title}</h1>
        <p className="single-post-meta">
          By {post.author} • {new Date(post.createdAt).toLocaleDateString()}
          {post.updatedAt !== post.createdAt && " (edited)"}
        </p>
        <div className="single-post-content">{post.contents}</div>
        {isOwner && (
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
