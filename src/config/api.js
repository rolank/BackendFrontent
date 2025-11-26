/**
 * API Configuration
 *
 * This file centralizes the backend API URL configuration.
 *
 * How it works:
 * 1. During Docker build, GitHub Actions passes --build-arg BUILD_ARG_BACKEND_URL=<url>
 * 2. Dockerfile receives it as ARG BUILD_ARG_BACKEND_URL
 * 3. Dockerfile sets ENV VITE_BACKEND_URL=${BUILD_ARG_BACKEND_URL}
 * 4. Vite reads import.meta.env.VITE_BACKEND_URL during build and replaces it with the actual value
 * 5. The built JavaScript contains the hardcoded backend URL
 *
 * About import.meta.env:
 * - This is a Vite-specific feature for accessing environment variables
 * - Only variables prefixed with VITE_ are exposed (security feature)
 * - Values are replaced at BUILD TIME, not runtime (static replacement in the bundled code)
 * - After build, import.meta.env.VITE_BACKEND_URL becomes a hardcoded string in the JavaScript
 *
 * For local development:
 * - If VITE_BACKEND_URL is not set, it defaults to http://localhost:8080/api/v1
 * - You can set it in .env file or pass it when running: VITE_BACKEND_URL=<url> npm run dev
 */

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8080/api/v1";

if (!import.meta.env.VITE_BACKEND_URL) {
  console.warn("VITE_BACKEND_URL not set, using default:", BACKEND_URL);
}

export const API_BASE_URL = BACKEND_URL;
