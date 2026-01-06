# Full-Stack Blog Project

A modern full-stack web application with Express backend, React frontend, and MongoDB database. Deployed on Google Cloud Platform with CI/CD pipeline.

## Project Structure

```
├── backend/                 # Express.js REST API
│   ├── src/
│   ├── package.json
│   ├── jest.config.json
│   ├── Dockerfile
│   ├── README.md           # Backend documentation
│   └── TESTING.md          # Backend testing guide
├── src/                    # React frontend
│   ├── components/
│   ├── api/
│   └── config/
├── public/                 # Static assets
├── package.json            # Frontend dependencies
├── Dockerfile              # Frontend image
├── docker-compose.yaml     # Local development
└── README.md              # This file
```

## Quick Start

### Prerequisites

- Node.js 22.x+
- Docker & Docker Compose (optional, for local deployment)
- MongoDB 8.0.11+ (for backend - can run via Docker)

### Local Development

**1. Install dependencies:**

```bash
# Frontend (from root)
npm install

# Backend
cd backend
npm install
```

**2. Start MongoDB (required for backend):**

```bash
docker run -d --name dbserver -p 27017:27017 --restart unless-stopped mongo:8.0.11
```

**3. Setup environment files:**

```bash
# Backend
cd backend
cp .env.example .env
# Update .env with DATABASE_URL if needed
```

**4. Run the applications:**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend (from root)
npm run dev
```

Frontend will be available at `http://localhost:5173`
Backend will be available at `http://localhost:8080`

### Testing

**Frontend tests (using Vitest):**

```bash
# Run all tests
npm test

# Run tests in UI mode
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

**Backend tests (using Jest):**

```bash
cd backend
npm test
```

### Building for Production

**Frontend:**

```bash
npm run build
npm run preview  # Preview the production build locally
```

**Backend:**

Docker image is built automatically in the CI/CD pipeline. See `.github/workflows/cd-backend.yaml`

---

## Frontend Development

### Frontend Stack

- **Framework**: React 19
- **Build Tool**: Vite 6
- **Entry Point**: `src/main.jsx` (Vite's default entry point)
- **Testing**: Vitest + React Testing Library
- **Routing**: React Router v7
- **State Management**: React Query (TanStack Query)
- **Styling**: CSS modules
- **Linting**: ESLint
- **Code Formatting**: Prettier

### Frontend Scripts

```bash
npm run dev       # Start Vite dev server (http://localhost:5173)
npm run build     # Build for production
npm run preview   # Preview production build
npm run test      # Run tests with Vitest
npm run test:ui   # Run tests with interactive UI
npm run test:coverage  # Run tests with coverage report
npm run lint      # Check code style with ESLint
npm start         # Serve production build
```

### Testing the Frontend

The frontend uses **Vitest** for unit and component testing:

**Run tests:**

```bash
npm test
```

**Run tests with UI:**

```bash
npm run test:ui
```

**Run tests with coverage:**

```bash
npm run test:coverage
```

**Writing tests:**

```javascript
// src/components/MyComponent.test.jsx
import { render, screen } from "@testing-library/react";
import MyComponent from "./MyComponent";

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
```

### Frontend Test Specifications

#### Test File Structure

**Naming Convention:**

- Test files use `.test.jsx` or `.test.js` extension
- Located alongside component files: `src/components/MyComponent.jsx` → `src/components/MyComponent.test.jsx`
- Vitest automatically discovers files matching `src/**/*.test.{js,jsx,ts,tsx}`

**File Organization:**

```
src/
├── components/
│   ├── Layout.jsx
│   ├── Layout.test.jsx      # Test for Layout
│   ├── Post.jsx
│   ├── Post.test.jsx        # Test for Post
│   └── PostList.jsx
│       └── PostList.test.jsx # Test for PostList
├── pages/
│   ├── HomePage.jsx
│   └── HomePage.test.jsx    # Test for HomePage
└── api/
    ├── posts.js
    └── posts.test.js        # Test for API functions
```

#### Basic Test Pattern

```javascript
// src/components/Layout.test.jsx
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Layout from "./Layout";

describe("Layout Component", () => {
  // Setup common to all tests
  beforeEach(() => {
    // Clear mocks, reset state, etc.
  });

  it("renders navbar with links", () => {
    render(
      <BrowserRouter>
        <Layout />
      </BrowserRouter>,
    );

    expect(screen.getByRole("link", { name: /home/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /create post/i }),
    ).toBeInTheDocument();
  });

  it("displays user info when logged in", () => {
    // Test authenticated state
  });

  it("shows login link when not authenticated", () => {
    // Test unauthenticated state
  });
});
```

#### Testing User Interactions

```javascript
// src/components/CreatePost.test.jsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreatePost from "./CreatePost";

describe("CreatePost Component", () => {
  it("submits form with user input", async () => {
    const user = userEvent.setup();
    const mockSubmit = vi.fn();

    render(<CreatePost onSubmit={mockSubmit} />);

    // User fills form
    await user.type(screen.getByLabelText(/title/i), "Test Post");
    await user.type(screen.getByLabelText(/content/i), "Post content");

    // User clicks submit
    await user.click(screen.getByRole("button", { name: /submit/i }));

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
```

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
          ]),
      }),
    );

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
      expect(screen.getByText("Post 1")).toBeInTheDocument();
      expect(screen.getByText("Post 2")).toBeInTheDocument();
    });
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
```

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
      "http://localhost:5173/posts?author=alice&sortBy=title",
    );

    const result = await loader({ request });

    expect(result.posts).toHaveLength(1);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("author=alice"),
    );
  });
});
```

#### Testing API Functions

```javascript
// src/api/posts.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getPosts, createPost } from "./posts";

describe("Posts API", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("fetches posts with query parameters", async () => {
    const mockPosts = [
      { _id: "1", title: "First Post", author: "alice" },
      { _id: "2", title: "Second Post", author: "bob" },
    ];

    // Mock fetch to return successful response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPosts,
    });

    const queryParams = { author: "alice", sortBy: "createdAt" };
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
