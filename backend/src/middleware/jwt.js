import { expressjwt as jwt } from "express-jwt";

/* Middleware to protect routes using JWT authentication.
 * It uses the secret from environment variables and HS256 algorithm.
 * The middleware excludes the login and signup routes from authentication.

unless({ path: [...] }) tells the JWT middleware to skip authentication for those specific routes.
So:
- /api/v1/user/login and /api/v1/user/signup are public (no token required)
All other routes require a valid JWT token in the Authorization header
Without unless, users couldn't log in or sign up because they don't have a token yet. This exempts those endpoints from authentication while protecting everything else.* 

*/

// Create middleware - will be initialized after loadConfig()
let _requireAuth = null;

export function initializeJwtMiddleware() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required");
  }

  _requireAuth = jwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
  }).unless({ path: ["/api/v1/user/login", "/api/v1/user/signup"] });

  return _requireAuth;
}

// Getter for the middleware
export function getRequireAuth() {
  if (!_requireAuth) {
    throw new Error(
      "JWT middleware not initialized. Call initializeJwtMiddleware() first.",
    );
  }
  return _requireAuth;
}

/* Wrapper middleware that defers execution until middleware is initialized.
 *
 * WHY THIS PATTERN?
 * When middleware is registered at route definition time (e.g., app.post("/api/v1/posts", requireAuth, ...)),
 * the middleware function isn't called immediately - it's just registered. The actual execution happens
 * later when a request arrives at that route.
 *
 * This wrapper exploits that timing:
 * - At route definition time: requireAuth is just registered (no execution)
 * - At request time: requireAuth executes and calls _requireAuth (which is now initialized)
 *
 * Without this wrapper, calling getRequireAuth() at route definition time would fail because
 * initializeJwtMiddleware() hasn't run yet (it runs in index.js after loadConfig()).
 *
 * INITIALIZATION SEQUENCE:
 *
 * index.js starts
 *   ↓
 * loadConfig() runs (loads environment variables from .env file)
 *   ↓
 * initializeJwtMiddleware() runs (sets _requireAuth variable)
 *   ↓
 * import app.js (which imports posts.js)
 *   ↓
 * postsRoutes(app) is called (registers all post routes)
 *   ↓
 * app.post("/api/v1/posts", requireAuth, ...) ← SUCCESS
 *    (just registers requireAuth as a middleware handler)
 *    (doesn't call it yet - no crash!)
 *   ↓
 * Request arrives at /api/v1/posts
 *   ↓
 * requireAuth(req, res, next) is called ← NOW it executes
 *   ↓
 * _requireAuth(req, res, next) is called (now _requireAuth exists)
 *   ↓
 * JWT verification happens
 *
 * USAGE:
 * import { requireAuth } from "../middleware/jwt.js";
 * app.post("/api/v1/posts", requireAuth, async (req, res) => { ... })
 *
 * NOT: app.post("/api/v1/posts", getRequireAuth(), ...) ← This would crash
 */
export function requireAuth(req, res, next) {
  if (!_requireAuth) {
    throw new Error(
      "JWT middleware not initialized. Call initializeJwtMiddleware() first.",
    );
  }
  return _requireAuth(req, res, next);
}
