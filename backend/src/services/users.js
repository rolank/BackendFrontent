/**
 * BACKEND USER AUTHENTICATION SERVICE
 *
 * This module handles server-side authentication logic:
 * - Credential validation against MongoDB database
 * - Password hashing/verification using bcrypt
 * - JWT token generation for authenticated users
 *
 * Security considerations:
 * - Passwords are hashed with bcrypt (10 salt rounds)
 * - Never returns passwordHash to client
 * - JWT tokens expire based on JWT_EXPIRES_IN environment variable
 * - All sensitive operations happen on server (never trusted client)
 *
 * Integration with frontend:
 * - Frontend (src/utils/auth.js) calls backend API endpoints
 * - This service processes requests and returns tokens
 * - Frontend stores token in localStorage for subsequent requests
 */

import bcrypt from "bcrypt";
import { User } from "../db/models/user.js";
import jwt from "jsonwebtoken";

export async function createUser({ username, email, password }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, email, passwordHash: hashedPassword });
  return user.save();
}

export function findUserByEmail(email) {
  return User.findOne({ email }).exec();
}

export function findByUserName(username) {
  return User.findOne({ username }).exec();
}

export async function validatePassword(email, password) {
  const user = await findUserByEmail(email);
  if (!user) return false;
  const isValid = await bcrypt.compare(password, user.password);
  return isValid ? user : false;
}

export async function deleteUser(username) {
  return User.deleteOne({ username: username });
}

export async function findUserId(userName) {
  const userId = await User.findOne({ username: userName })
    .select("_id")
    .exec();
  return userId ? userId._id : null;
}

/**
 * Login user with username and password
 *
 * Backend authentication logic:
 * 1. Find user by username in MongoDB database
 * 2. Compare provided password against stored bcrypt hash
 * 3. If valid, generate JWT token with user ID and username
 * 4. Return user data (WITHOUT password) and token to frontend
 *
 * The JWT token is used by frontend to authenticate subsequent API requests
 * via Authorization header: "Bearer <token>"
 *
 * Security:
 * - Password comparison is constant-time (bcrypt.compare)
 * - Password hash never sent to client
 * - JWT_SECRET must be kept secret (stored in GitHub Secrets)
 * - JWT token expires based on JWT_EXPIRES_IN (default: 1h)
 *
 * @param {string} userName - Username to authenticate
 * @param {string} password - Raw password (not hashed)
 * @returns {Promise<{ok: boolean, user?: object, token?: string, message?: string}>}
 */
export async function loginUser(userName, password) {
  // Query database for user by username
  const user = await findByUserName(userName);

  // Verify password using bcrypt (constant-time comparison for security)
  const isPasswordValid =
    user && (await bcrypt.compare(password, user.passwordHash));

  if (!user || !isPasswordValid) {
    return { ok: false, message: "Invalid username or password" };
  }

  // Create JWT token with user identity
  // Token is signed with JWT_SECRET and expires per JWT_EXPIRES_IN
  const token = jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN },
  );

  // Remove passwordHash before returning user object (security)
  // Destructure to pluck out passwordHash and keep the rest of fields in userWithoutPassword
  const { passwordHash, ...userWithoutPassword } = user.toObject();
  return { ok: true, user: userWithoutPassword, token };
}
