import { Form, Link, useActionData, useNavigation } from "react-router-dom";
import "./SignUpPage.css";

export function SignUpPage() {
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="signup-container">
      <h1 className="signup-title">Sign Up</h1>
      {actionData?.error && (
        <div className="signup-error">{actionData.error}</div>
      )}
      <Form method="post">
        <div className="signup-form-group">
          <label htmlFor="username" className="signup-label">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            required
            className="signup-input"
            disabled={isSubmitting}
          />
        </div>
        <div className="signup-form-group">
          <label htmlFor="email" className="signup-label">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="signup-input"
            disabled={isSubmitting}
          />
        </div>
        <div className="signup-form-group">
          <label htmlFor="password" className="signup-label">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            className="signup-input"
            disabled={isSubmitting}
          />
        </div>
        <div className="signup-form-group">
          <label htmlFor="confirmPassword" className="signup-label">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            required
            className="signup-input"
            disabled={isSubmitting}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="signup-submit-button"
        >
          {isSubmitting ? "Creating account..." : "Sign Up"}
        </button>
      </Form>
      <p className="signup-footer">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
