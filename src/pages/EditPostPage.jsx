import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
  Navigate,
} from "react-router-dom";
import { getCurrentUser } from "../utils/auth.js";
import "./EditPostPage.css";

export function EditPostPage() {
  const { post } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const currentUser = getCurrentUser();

  // Protect: only post owner can edit
  if (!currentUser || currentUser.username !== post.author) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="edit-post-container">
      <h1 className="edit-post-title">Edit Post</h1>
      {actionData?.error && (
        <div className="edit-post-error">{actionData.error}</div>
      )}
      <Form method="patch">
        <div className="edit-post-form-group">
          <label htmlFor="title" className="edit-post-label">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            defaultValue={post.title}
            required
            className="edit-post-input"
            disabled={isSubmitting}
          />
        </div>
        <div className="edit-post-form-group">
          <label htmlFor="author" className="edit-post-label">
            Author
          </label>
          <input
            type="text"
            id="author"
            name="author"
            defaultValue={post.author}
            readOnly
            required
            className="edit-post-input readonly"
            disabled={isSubmitting}
          />
        </div>
        <div className="edit-post-form-group">
          <label htmlFor="contents" className="edit-post-label">
            Content
          </label>
          <textarea
            id="contents"
            name="contents"
            defaultValue={post.contents}
            required
            rows={10}
            className="edit-post-textarea"
            disabled={isSubmitting}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="edit-post-submit-button"
        >
          {isSubmitting ? "Updating..." : "Update Post"}
        </button>
      </Form>
    </div>
  );
}
