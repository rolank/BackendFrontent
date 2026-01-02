import { redirect } from "react-router-dom";
import { login, signup, setAuthToken, setCurrentUser } from "../utils/auth.js";

/**
 * Action for login form submission
 */
export async function loginAction({ request }) {
  if (request.method !== "POST") {
    throw new Error("Invalid request method");
  }

  const formData = await request.formData();
  const username = formData.get("username");
  const password = formData.get("password");

  try {
    const result = await login(username, password);
    // Redirect to home page after successful login
    return redirect("/");
  } catch (error) {
    // Return error to be displayed in component
    return { error: error.message };
  }
}

/**
 * Action for signup form submission
 */
export async function signupAction({ request }) {
  if (request.method !== "POST") {
    throw new Error("Invalid request method");
  }

  const formData = await request.formData();
  const username = formData.get("username");
  const email = formData.get("email");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  // Validate passwords match
  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  try {
    const result = await signup(username, email, password);
    // After signup, automatically log in the user
    await login(username, password);
    // Redirect to home page
    return redirect("/");
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Action for logout
 */
export async function logoutAction() {
  // Clear auth data
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
  // Redirect to home
  return redirect("/");
}
