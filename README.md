## Full-Stack Blog Project

React frontend + Express/Mongoose backend for a blog application. The repository is deployed to Google Cloud Run, with GitHub Actions handling CI/CD, Docker Hub storing built images, and Google Workload Identity Federation handling GitHub-to-GCP authentication.

## Repository Layout

```text
.
├── backend/                  # Express API, MongoDB models, Jest/Playwright tests
├── src/                      # React app, routes, pages, React Query data layer
├── public/                   # Static assets
├── .github/workflows/        # CI/CD definitions and workflow docs
├── compose.yaml              # Local multi-container setup
├── Dockerfile                # Frontend image build
├── default.conf              # Nginx config for frontend container
├── REACT-QUERY-GUIDE.md      # React Query notes
└── README.md                 # Project overview
```

## Stack

- Frontend: React 19, React Router 7, TanStack Query, Vite 6
- Backend: Express 5, Mongoose 9, JWT auth, dotenv
- Database: MongoDB 8
- Tests: Vitest on the frontend, Jest and Playwright smoke tests on the backend
- Deployment: Docker images pushed to Docker Hub, deployed to Cloud Run
- Auth to GCP: GitHub Actions OIDC via Workload Identity Federation

## Local Development

### Prerequisites

- Node.js 22+
- npm
- Docker (recommended for MongoDB and compose-based local runs)

### Install Dependencies

```bash
npm install
cd backend && npm install
```

### Start MongoDB Locally

```bash
docker run -d --name dbserver -p 27017:27017 --restart unless-stopped mongo:8.0.11
```

### Backend Environment

Create `backend/.env` if it does not already exist. A typical local setup is:

```dotenv
NODE_ENV=development
DATABASE_URL=mongodb://localhost:27017/blog
PORT=8080
JWT_SECRET=replace-me
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

### Run the App

```bash
# terminal 1
cd backend
npm run dev

# terminal 2
cd /path/to/BackendFrontent
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`
- Frontend fallback API URL: `http://localhost:8080/api/v1`

The frontend reads `VITE_BACKEND_URL` at build time. For local dev, if that variable is not supplied, it falls back to `http://localhost:8080/api/v1`.

## Local Docker Compose

The repo also includes [compose.yaml](compose.yaml) for a containerized local setup:

```bash
docker compose up --build
```

Current compose ports:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- MongoDB: `mongodb://localhost:27017`

## Tests and Quality Checks

### Frontend

```bash
npm test
npm run test:ui
npm run test:coverage
npm run lint
npm run build
```

### Backend

```bash
cd backend
npm test
npm run test:integration
npm run test:smoke
```

## Deployment Overview

Production uses two Cloud Run services:

- Frontend: `blog-frontend-service`
- Backend: `blog-backend-service`

Current production backend API URL used by the frontend build:

```text
https://blog-backend-service-1010347128743.us-central1.run.app/api/v1
```

### How Frontend Production Builds Work

The frontend image is built from the root [Dockerfile](Dockerfile). The workflow passes:

```text
BUILD_ARG_BACKEND_URL=https://blog-backend-service-1010347128743.us-central1.run.app/api/v1
```

The Dockerfile maps that build arg to `VITE_BACKEND_URL`, so the final JS bundle contains the production API URL at build time.

### How Backend Production Deploys Work

The backend image is built from `backend/Dockerfile` and deployed to Cloud Run with:

- `NODE_ENV=production`
- `JWT_EXPIRES_IN=7d`
- `DATABASE_URL` from GCP Secret Manager secret `MONGODB_URI`
- `JWT_SECRET` from GCP Secret Manager secret `JWT_SECRET`

### Image Registry

Both frontend and backend images are built in GitHub Actions and pushed to Docker Hub with a commit-SHA tag:

```text
<dockerhub-username>/blog-frontend:<commit-sha>
<dockerhub-username>/blog-backend:<commit-sha>
```

## GitHub / GCP Configuration Summary

### GitHub Variables

- `DOCKERHUB_USERNAME`

### GitHub Secrets

- `DOCKERHUB_TOKEN`

### GCP

- Project ID: `oidc-github-01`
- Region: `us-central1`
- Workload Identity Provider: `projects/1010347128743/locations/global/workloadIdentityPools/github-pool/providers/github-provider`
- Deployer service account: `cloudrun-deployer@oidc-github-01.iam.gserviceaccount.com`

## Important Notes

- Frontend API configuration is a build-time concern, not a runtime env var inside the browser.
- [backend/README.md](backend/README.md)
- [.github/workflows/README.md](.github/workflows/README.md)
- [REACT-QUERY-GUIDE.md](REACT-QUERY-GUIDE.md)
- [backend/TESTING.md](backend/TESTING.md)
- [backend/ENV_CONFIG.md](backend/ENV_CONFIG.md)

      // Verify submission
      expect(mockSubmit).toHaveBeenCalledWith({
        title: "Test Post",
        content: "Post content",
      });

  });

  it("validates required fields", async () => {
  const user = userEvent.setup();

      render(<CreatePost />);

      // Try to submit empty form
      await user.click(screen.getByRole("button", { name: /submit/i }));

      // Verify error message
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();

  });
  });

````

#### Testing with Async Operations

```javascript
// src/components/PostList.test.jsx
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PostList from "./PostList";

describe("PostList Component", () => {
  it("loads and displays posts", async () => {
    // Mock fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve([
            { _id: "1", title: "Post 1", author: "alice" },
            { _id: "2", title: "Post 2", author: "bob" },

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <PostList />
      </QueryClientProvider>,
    );

    // Wait for data to load
    await waitFor(() => {
  });

  it("handles loading state", () => {
    // Component should show spinner/loading text while fetching
    render(<PostList />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("handles error state", async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error("Network error")));

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <PostList />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
#### Testing with React Router

```javascript
// src/routes/posts.loader.test.js
import { postsLoader } from "./posts.loader";
import { QueryClient } from "@tanstack/react-query";

describe("Posts Loader", () => {
  it("fetches posts with filters from URL", async () => {
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([{ _id: "1", title: "Post 1" }]),
      }),
    );
    global.fetch = mockFetch;

    const queryClient = new QueryClient();
    const loader = postsLoader(queryClient);

    // Simulate request with query parameters
    const request = new Request(

    expect(result.posts).toHaveLength(1);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("author=alice"),
    );
  });
});
````

#### Testing API Functions

```javascript
// src/api/posts.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("Posts API", () => {
  const originalFetch = global.fetch;
  beforeEach(() => {
    global.fetch = vi.fn();
  });
  });

  it("fetches posts with query parameters", async () => {

    // Mock fetch to return successful response
    global.fetch.mockResolvedValueOnce({
    const posts = await getPosts(queryParams);

    // Verify fetch was called correctly
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("author=alice"),
      expect.any(Object),
    );

    // Verify response
    expect(posts).toEqual(mockPosts);
  });

  it("throws error when fetch fails", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(getPosts({})).rejects.toThrow("Failed to fetch posts");
  });

  it("creates a post successfully", async () => {
    const newPost = {
      title: "New Post",
      contents: "Content here",
      author: "charlie",
    };

    const mockResponse = {
      _id: "123",
      ...newPost,
      createdAt: "2026-01-05T12:00:00Z",
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await createPost(newPost);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/posts"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(newPost),
      }),
    );

    expect(result).toEqual(mockResponse);
  });

  it("spies on console.log", async () => {
    const consoleSpy = vi.spyOn(console, "log");

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ _id: "123" }),
    });

    await createPost({ title: "Test" });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Creating post:",
      expect.any(Object),
    );

    consoleSpy.mockRestore();
  });
});
```

**Mocking Techniques:**

- `vi.fn()` - Create a mock function
- `mockResolvedValueOnce()` - Mock successful async response
- `mockRejectedValueOnce()` - Mock error/rejection
- `expect.any(Object)` - Match any object parameter
- `expect.stringContaining()` - Match partial string
- `vi.spyOn(object, method)` - Spy on existing function
- `mock.calls` - Inspect function call arguments

#### Testing Authenticated Components

```javascript
// src/pages/CreatePostPage.test.jsx
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import CreatePostPage from "./CreatePostPage";

describe("CreatePostPage", () => {
  it("redirects to login if not authenticated", () => {
    // Mock auth context to return unauthenticated
    localStorage.removeItem("authToken");

    render(
      <BrowserRouter>
        <CreatePostPage />
      </BrowserRouter>,
    );

    // Should redirect to login
    expect(window.location.pathname).toBe("/login");
  });

  it("allows creating post when authenticated", async () => {
    // Mock auth token
    localStorage.setItem("authToken", "token123");
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ _id: "1", title: "New Post" }),
      }),
    );

    render(
      <BrowserRouter>
        <CreatePostPage />
      </BrowserRouter>,
    );

    // Form should be visible
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
  });
});
```

#### Test Utilities & Best Practices

**Setup file (if needed for common test configuration):**

```javascript
// src/test/setup.js
import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;
```

**Important: Test Cleanup**

Always call `cleanup()` in `afterEach()` to remove rendered components between tests. Without cleanup, components from previous tests remain in the DOM, causing "multiple elements found" errors:

```javascript
import { render, cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

describe("MyComponent", () => {
  afterEach(() => {
    cleanup(); // Critical: removes previous test's DOM
  });

  it("test 1", () => {
    render(<MyComponent />);
    // Component rendered
  });

  it("test 2", () => {
    render(<MyComponent />);
    // Without cleanup(), test 1's component still exists
    // Result: 2 instances in DOM → "multiple elements found" error
  });
});
```

**Container Queries for Isolation**

When tests share similar data or multiple tests render the same component, use container queries to scope assertions to the current render:

```javascript
it("renders with specific id", () => {
  const { container } = render(<Post id="123" />);

  // Query within THIS test's container only
  const link = container.querySelector("a.post-title-link");
  expect(link).toHaveAttribute("href", "/posts/123");
});
```

**Best Practices:**

1. **Query Priority** - Use semantic queries in this order:

   - `getByRole()` - buttons, links, headings
   - `getByLabelText()` - form inputs
   - `getByPlaceholderText()` - input fields
   - `getByText()` - any visible text
   - `getByTestId()` - last resort (not user-facing)

2. **Async Testing** - Always `await` user interactions:

   ```javascript
   const user = userEvent.setup();
   await user.click(button); // ✓ correct
   user.click(button); // ✗ wrong
   ```

3. **Mocking Fetch** - Mock at start of test:

   ```javascript
   global.fetch = vi.fn(() => Promise.resolve(...));
   ```

4. **Wait for Elements** - Use `waitFor()` for async rendering:

   ```javascript
   await waitFor(() => {
     expect(screen.getByText("Loaded")).toBeInTheDocument();
   });
   ```

5. **Test Behavior, Not Implementation** - Test what users see/do:

   ```javascript
   // ✓ Good - tests user action
   await user.click(screen.getByRole("button", { name: /delete/i }));

   // ✗ Bad - tests internal state
   expect(component.state.deleted).toBe(true);
   ```

6. **Clean Up Resources** - Reset mocks after each test:
   ```javascript
   afterEach(() => {
     cleanup();
     vi.clearAllMocks();
   });
   ```

### Current Test Coverage

**Layout Component Tests** ([src/components/Layout.test.jsx](src/components/Layout.test.jsx))

Tests the main application layout including navigation and authentication UI:

- ✅ Renders header with "My Blog" logo
- ✅ Renders home navigation link
- ✅ Renders footer with copyright text

Uses `vi.mock()` to mock React Router's `useRouteLoaderData` hook for testing different authentication states.

**Post Component Tests** ([src/components/Post.test.jsx](src/components/Post.test.jsx))

Tests individual blog post display component:

- ✅ Renders post title as clickable link with correct href
- ✅ Renders post content text
- ✅ Renders author information when provided
- ✅ Hides author section when author not provided
- ✅ Handles both string and numeric IDs
- ✅ Applies correct CSS class to article element

Demonstrates proper use of `cleanup()` in `afterEach()` and container queries to avoid DOM pollution between tests.

**Posts API Tests** ([src/api/posts.test.js](src/api/posts.test.js))

Tests API client functions with comprehensive mocking:

- ✅ Fetches posts with query parameters
- ✅ Fetches posts without parameters
- ✅ Handles HTTP errors (500 status)
- ✅ Handles network failures
- ✅ Creates new posts with correct request format
- ✅ Handles validation errors (422 status)
- ✅ Spies on console.log calls

Demonstrates critical mocking patterns:

- `global.fetch = vi.fn()` for mocking HTTP calls
- `mockResolvedValueOnce()` for successful responses
- `mockRejectedValueOnce()` for error handling
- `vi.spyOn()` for tracking function calls
- `expect.stringContaining()` and `expect.any()` for flexible assertions

**Test Summary:** 18 tests passing across 3 test suites

### Backend API Integration

The frontend connects to the backend API at:

- **Development**: `http://localhost:8080/api/v1`
- **Production**: `https://blog-backend-service-591006590099.us-central1.run.app/api/v1`

The API URL is configured in [`src/config/api.js`](./src/config/api.js)

### Data Loading with React Router Loaders

The frontend uses **React Router loaders** with **React Query** for optimized data fetching:

#### How Loaders Work

Loaders are async functions that **fetch data before rendering** a page component:

```javascript
// App.jsx
{
  index: true,
  Component: HomePage,
  loader: postsLoader(queryClient),  // Fetch posts BEFORE rendering
}
```

**Higher-Order Function Pattern:**

```javascript
// src/routes/posts.loader.js
export function postsLoader(queryClient) {
  return async ({ request }) => {
    // This function runs when route is accessed, before component renders
    const posts = await queryClient.fetchQuery({ ... });
    return { posts };  // Data passed to component via useLoaderData()
  };
}
```

**Why Higher-Order Functions?**

The HOF pattern solves a **dependency injection problem**:

- React Router automatically calls loaders—you can't manually pass `queryClient` to them
- The HOF captures `queryClient` in a **closure**, making it available to the inner loader function
- When you call `postsLoader(queryClient)` in `App.jsx`, you're "configuring" the loader with its dependency

**Without HOF (doesn't work):**

```javascript
// ❌ queryClient not available
export async function postsLoader({ request }) {
  const posts = await queryClient.fetchQuery({ ... });  // ERROR: queryClient is undefined
}
```

**With HOF (works):**

```javascript
// ✅ queryClient captured in closure
export function postsLoader(queryClient) {
  return async ({ request }) => {
    const posts = await queryClient.fetchQuery({ ... });  // ✓ Works!
  };
}

// In App.jsx: pass queryClient once
loader: postsLoader(queryClient)
```

This pattern makes loaders flexible, testable, and dependency-aware.

**What is `request`?**

React Router passes a Fetch API `Request` object to loaders. Useful fields:

- `request.url` — full URL including query string (used to read filters/sorting)
- `request.method` — HTTP method
- `request.headers` — headers for the navigation request

Example:

```javascript
const url = new URL(request.url);
const author = url.searchParams.get("author") || "";
const sortBy = url.searchParams.get("sortBy") || "createdAt";
```

#### Query Keys for Smart Caching

React Query uses **unique cache keys** to manage separate data sets:

```javascript
// Extract URL parameters: ?author=alice&sortBy=title&sortOrder=ascending
const author = url.searchParams.get("author") || "";
const sortBy = url.searchParams.get("sortBy") || "createdAt";
const sortOrder = url.searchParams.get("sortOrder") || "descending";

// Create unique cache key - changes if any filter/sort changes
const queryKey = ["posts", { author, sortBy, sortOrder }];
```

**Example Cache Keys:**

- `["posts", { author: "alice", sortBy: "title", sortOrder: "ascending" }]` - User filters by alice
- `["posts", { author: "bob", sortBy: "createdAt", sortOrder: "descending" }]` - User switches to bob
- `["post", "123"]` - Single post view by ID

**Benefits:**

- Data is cached **per filter/sort combination**
- Switching back to previous filters reuses cached data (no extra fetch)
- Cache expires after `staleTime` (default: 5 minutes)
- Prevents redundant API calls while keeping data fresh

#### Single Post Loading

For detail pages, loaders fetch individual resources:

```javascript
export function postLoader(queryClient) {
  return async ({ params }) => {
    const { postId } = params;
    const queryKey = ["post", postId];

    const post = await queryClient.fetchQuery({
      queryKey,
      queryFn: async () => {
        // Fetch /api/v1/posts/123
        const response = await fetch(`${API_BASE_URL}/posts/${postId}`);
        return response.json();
      },
    });

    return { post };
  };
}
```

---

## Authentication Architecture

### Separation of Concerns

This is a **microservices architecture** with clear separation between frontend and backend authentication:

#### Frontend (React) - `src/utils/auth.js`

- **Responsibility**: Client-side API integration and state management
- **Functions**:
  - `login(username, password)` - Sends credentials to backend API
  - `signup(...)` - Calls backend signup endpoint
  - Stores JWT token and user data in localStorage
  - Provides token via `getAuthHeaders()` for authenticated API requests
- **Security**: Never handles password validation; delegates to backend

#### Backend (Express) - `backend/src/services/users.js`

- **Responsibility**: Core authentication logic and security
- **Functions**:
  - `loginUser(userName, password)` - Validates credentials against database
  - `createUser(...)` - Hashes password with bcrypt before storage
  - `validatePassword(...)` - Constant-time password comparison
- **Security**:
  - Passwords hashed with bcrypt (10 salt rounds)
  - JWT tokens generated server-side
  - JWT_SECRET never exposed to frontend
  - Password hashes never sent to client

### Authentication Flow

```
1. User enters credentials in LoginPage → calls frontend login()
                    ↓
2. Frontend login() sends HTTP POST to backend /user/login
                    ↓
3. Backend loginUser() validates credentials against database
   - Finds user by username
   - Compares password with bcrypt.compare()
   - Generates JWT token signed with JWT_SECRET
                    ↓
4. Backend returns { token, user } to frontend
                    ↓
5. Frontend stores token in localStorage via setAuthToken()
                    ↓
6. Subsequent API requests include token in Authorization header:
   Authorization: Bearer <jwt_token>
                    ↓
7. Backend jwt.js middleware verifies token on each request
```

### Environment Variables

**Backend requires (stored in GitHub Secrets → GitHub Actions → Cloud Run):**

- `JWT_SECRET` - Secret key for signing/verifying JWT tokens
- `JWT_EXPIRES_IN` - Token expiration time (default: "1h")
- `DATABASE_URL` - MongoDB connection string

**Frontend requires (no secrets needed):**

- Uses `API_BASE_URL` from `src/config/api.js` (public)
- No sensitive data stored in frontend code

---

## Backend Development

See [backend/README.md](./backend/README.md) for detailed backend setup and testing instructions.

### Backend Stack

- **Runtime**: Node.js 22
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Testing**: Jest
- **Linting**: ESLint

---

## Docker & Docker Compose

### Local Development with Docker Compose

```bash
docker compose up
```

This starts:

- **Frontend**: http://localhost:3000 (nginx, port 8080)
- **Backend**: http://localhost:3001 (port 8080)
- **MongoDB**: mongodb://localhost:27017

Ports mapped: `3000:8080` (frontend), `3001:8080` (backend)

### Stop services:

```bash
docker compose down
```

## Documentation

- **[Backend README](./backend/README.md)** - Express API, setup, and structure
- **[Backend Testing Guide](./backend/TESTING.md)** - Jest configuration and test architecture
- **[Environment Configuration](./backend/ENV_CONFIG.md)** - Environment variables setup
- **Frontend** - React/Vite setup and components

## Technology Stack

### Backend

- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Testing**: Jest with in-memory MongoDB
- **Validation**: Mongoose schemas
- **Authentication**: Ready for JWT integration

### Frontend

- **Framework**: React 19
- **Build Tool**: Vite
- **HTTP Client**: Fetch API
- **Routing**: React Router v7
- **State Management**: React Query

### Infrastructure

- **Containerization**: Docker
- **Orchestration**: Docker Compose (local), Cloud Run (production)
- **Cloud Platform**: Google Cloud Platform
- **CI/CD**: GitHub Actions
- **Database**: MongoDB Atlas (production)

## API Endpoints

### Posts

- `GET /api/v1/posts` - List all posts (with filtering/sorting)
- `POST /api/v1/posts` - Create post
- `GET /api/v1/posts/:id` - Get specific post
- `PUT /api/v1/posts/:id` - Update post
- `DELETE /api/v1/posts/:id` - Delete post

### Users

- `GET /api/v1/users/:username` - Get user
- `POST /api/v1/users` - Create user
- `DELETE /api/v1/users/:username` - Delete user

Full API documentation see [backend/README.md](./backend/README.md)

## Environment Configuration

The project uses environment-specific configuration:

- `.env` - Default/local development
- `.env.development` - Development environment
- `.env.production` - Production (GCP)
- `.env.staging` - Staging environment
- `.env.test` - Test environment (backend only)

Backend automatically loads the appropriate `.env.[NODE_ENV]` file.

See [backend/ENV_CONFIG.md](./backend/ENV_CONFIG.md) for details.

## Deployment

### Google Cloud Platform

**Frontend deployment:**

```bash
gcloud builds submit --tag gcr.io/YOUR-PROJECT/blog-frontend \
  --build-arg BUILD_ARG_BACKEND_URL=https://your-backend-url/api/v1

gcloud run deploy blog-frontend \
  --image gcr.io/YOUR-PROJECT/blog-frontend \
  --region us-central1
```

**Backend deployment:**

```bash
cd backend
gcloud builds submit --tag gcr.io/YOUR-PROJECT/blog-backend

gcloud run deploy blog-backend \
  --image gcr.io/YOUR-PROJECT/blog-backend \
  --region us-central1 \
  --set-env-vars DATABASE_URL=mongodb+srv://...
```

See CI/CD workflows in `.github/workflows/` for automated deployment.

## Project Highlights

✅ **Monorepo structure** - Frontend and backend in one repository  
✅ **Comprehensive tests** - Backend with Jest and in-memory MongoDB  
✅ **Environment management** - Different configs for dev/staging/prod  
✅ **Docker support** - Local development with Docker Compose  
✅ **CI/CD pipeline** - GitHub Actions for automated deployment  
✅ **Cloud native** - Designed for Google Cloud Platform  
✅ **Type safe** - Mongoose schemas for database validation  
✅ **API documented** - Clear endpoint structure with filtering/sorting

## Development Workflow

1. **Make changes** in `src/` (frontend) or `backend/src/` (backend)
2. **Run tests**: `cd backend && npm run test`
3. **Check linting**: `npm run lint`
4. **Commit** with clear messages
5. **Push** - GitHub Actions will test and deploy

## Troubleshooting

### Frontend can't connect to backend

- Check `VITE_BACKEND_URL` is set correctly
- See [backend/README.md](./backend/README.md#troubleshooting)

### Tests failing

- Ensure `npm install` completed in backend
- See [backend/TESTING.md](./backend/TESTING.md#troubleshooting)

### Docker issues

- Stop all containers: `docker compose down`
- Remove dangling containers: `docker system prune`
- Rebuild: `docker compose build --no-cache`

## License

ISC

## Contributing

1. Create a feature branch
2. Make changes
3. Run backend tests: `cd backend && npm run test`
4. Run linter: `npm run lint`
5. Push and create a pull request

**To check the FrontEnd, go back to: http://localhost:3000**

#### .env file

Since .env contains sensitive credentials, so it should always be in .gitignore file to prevent you from accidentally committing passwords, secrets, or tokens.
Make a copy of .env.template file that contains the variable names without actual secrets

```bash
cd backend/
cp .env.template .env
```

### Start

if, `mongo` is not nunning, run the following command to start a new container:

```bash
docker run -d --name dbserver -p 27017:27017 --restart unless-stopped mongo:8.0.11
```

To run the backend in dev mode, run the following command:

```bash
npm run dev
```

For production mode, run:

```bash
npm start
```

**To acces the API, go to: http://localhost:3001/api/v1/posts**

To exit the web server, press the `Ctrl+C` key combination.

## Frontend

### Requirements

1. Before running the frontend, please make sure to start the backend by following the instructions above.
2. To install the dependencies for the frontend by running this following command:

```bash
npm install
```

### Start

To start the app in development mode, run the following command:

```bash
npm run dev
```
