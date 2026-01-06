import { API_BASE_URL } from "../config/api.js";

/**
 * FRONTEND AUTHENTICATION UTILITIES
 *
 * This module handles client-side authentication state management.
 * It communicates with the backend API (backend/src/services/users.js) which
 * performs the actual credential validation and token generation.
 *
 * Architecture:
 * - Frontend (this file): API integration + localStorage management
 * - Backend (users.js service): Credential validation + JWT token creation
 *
 * Data flow:
 * 1. User submits credentials in login form
 * 2. login() sends HTTP request to backend API
 * 3. Backend validates credentials and returns { token, user }
 * 4. Frontend stores token + user in localStorage
 * 5. Token is sent with all subsequent API requests via Authorization header
 */

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

/**
 * Store auth token in localStorage
 */
export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

/**
 * Retrieve auth token from localStorage
 */
export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Store user data in localStorage
 */
export function setCurrentUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

/**
 * Retrieve user data from localStorage
 */
export function getCurrentUser() {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

/**
 * Clear auth data from localStorage
 */
export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Login user with username and password
 *
 * Client-side login orchestration:
 * 1. Sends credentials to backend API endpoint (/user/login)
 * 2. Backend validates credentials against database (see backend/src/services/users.js:loginUser)
 * 3. Backend returns JWT token if credentials are valid
 * 4. Frontend stores token and user data in localStorage
 * 5. Token is used in Authorization header for subsequent API requests
 *
 * @param {string} username - User's username
 * @param {string} password - User's password (sent over HTTPS only)
 * @returns {Promise<{ok: boolean, user: object, token: string}>}
 * @throws {Error} Login failed if credentials invalid or network error
 */
export async function login(username, password) {
  const response = await fetch(`${API_BASE_URL}/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Login failed");
  }

  const data = await response.json();
  setAuthToken(data.token); // Store JWT token for API requests
  setCurrentUser(data.user); // Store user profile data
  return data;
}

/**
 * Sign up new user
 */
export async function signup(username, email, password) {
  const response = await fetch(`${API_BASE_URL}/user/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Signup failed");
  }

  const data = await response.json();
  return data;
}

/**
 * Logout user
 */
export function logout() {
  clearAuth();
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
  // !! coerces the token value to a strict boolean (true if token exists, false otherwise)
  return !!getAuthToken();
}

/**
 * Get auth headers for API requests
 */
export function getAuthHeaders() {
  const token = getAuthToken();
  // Provide Authorization header when a JWT token is available; otherwise return empty headers
  return token ? { Authorization: `Bearer ${token}` } : {};
}
