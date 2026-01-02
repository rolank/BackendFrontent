import { Form, useActionData, useNavigation, Navigate } from "react-router-dom";
import { isAuthenticated, getCurrentUser } from "../utils/auth.js";
import "./CreatePostPage.css";

export function CreatePostPage() {
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const currentUser = getCurrentUser();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="create-post-container">
      <h1 className="create-post-title">Create New Post</h1>
      {actionData?.error && (
        <div className="create-post-error">{actionData.error}</div>
      )}
      <Form method="post">
        <div className="create-post-form-group">
          <label htmlFor="title" className="create-post-label">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className="create-post-input"
            disabled={isSubmitting}
          />
        </div>
        <div className="create-post-form-group">
          <label htmlFor="author" className="create-post-label">
            Author
          </label>
          <input
            type="text"
            id="author"
            name="author"
            value={currentUser?.username || ""}
            readOnly
            required
            className="create-post-input readonly"
            disabled={isSubmitting}
          />
        </div>
        <div className="create-post-form-group">
          <label htmlFor="contents" className="create-post-label">
            Content
          </label>
          <textarea
            id="contents"
            name="contents"
            required
            rows={10}
            className="create-post-textarea"
            disabled={isSubmitting}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="create-post-submit-button"
        >
          {isSubmitting ? "Creating..." : "Create Post"}
        </button>
      </Form>
    </div>
  );
}
