import { getCurrentUser, isAuthenticated } from "../utils/auth.js";

/**
 * Loader for auth state
 * Called when app loads to restore user session
 * Returns the current user or null if not authenticated
 */
export async function authLoader() {
  if (isAuthenticated()) {
    const user = getCurrentUser();
    return { user, isAuthenticated: true };
  }
  return { user: null, isAuthenticated: false };
}
