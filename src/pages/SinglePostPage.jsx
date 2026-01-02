import { useLoaderData, Link, Form } from "react-router-dom";
import { getCurrentUser, isAuthenticated } from "../utils/auth.js";
import "./SinglePostPage.css";

export function SinglePostPage() {
  const { post } = useLoaderData();
  const currentUser = getCurrentUser();
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
