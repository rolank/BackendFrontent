import { Form, Link, useActionData, useNavigation } from "react-router-dom";
import "./LoginPage.css";

export function LoginPage() {
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="login-container">
      <h1 className="login-title">Login</h1>
      {actionData?.error && (
        <div className="login-error">{actionData.error}</div>
      )}
      <Form method="post">
        <div className="login-form-group">
          <label htmlFor="username" className="login-label">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            required
            className="login-input"
            disabled={isSubmitting}
          />
        </div>
        <div className="login-form-group">
          <label htmlFor="password" className="login-label">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            className="login-input"
            disabled={isSubmitting}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="login-submit-button"
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </Form>
      <p className="login-footer">
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </div>
  );
}
