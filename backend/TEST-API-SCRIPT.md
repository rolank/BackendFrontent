# Manual API Testing Script

This script provides ready-to-use test cases for testing all backend API endpoints including protected routes.

## Quick Start

### 1. Start the server

```bash
npm run dev
```

### 2. In another terminal, run tests

**Run all tests:**

```bash
node test-api.js testAllRoutes
```

**Run specific tests:**

```bash
# User Authentication
node test-api.js testSignup
node test-api.js testLogin
node test-api.js testLoginWithWrongPassword
node test-api.js testGetUser

# Posts - Public Routes
node test-api.js testListPosts
node test-api.js testGetPost

# Posts - Protected Routes (Authenticated)
node test-api.js testCreatePost
node test-api.js testUpdatePost
node test-api.js testDeletePost

# Protected Routes - Negative Tests (Should Fail)
node test-api.js testCreatePostWithoutAuth
node test-api.js testUpdatePostWithoutAuth
node test-api.js testDeletePostWithoutAuth
```

## Example Output

```
=== USER LOGIN TEST ===
Testing: POST /user/login
Request body: {"username":"testuser_1702207800123","password":"TestPassword123!"}
Status: 200
Response: {
  "user": {
    "_id": "6576a1b2c3d4e5f6g7h8i9j0",
    "username": "testuser_1702207800123",
    "email": "testuser_1702207800123@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
✓ Login successful!
Token obtained: eyJhbGciOiJIUzI1NiIsIn...
```

## API Endpoints Being Tested

### Public Routes (No Authentication Required)

- `GET /user/:username` - Get user by username
- `GET /posts` - List all posts with filtering/sorting
- `GET /posts/:id` - Get specific post

### User Routes (Public)

- `POST /user/signup` - Create new user account
- `POST /user/login` - Login and get JWT token

### Protected Post Routes (Authentication Required)

- `POST /posts` - Create a new post
- `PATCH /posts/:id` - Update a post
- `DELETE /posts/:id` - Delete a post

## How It Works

The script:

1. **Stores credentials** - Uses `testuser_${timestamp}` for unique usernames
2. **Manages tokens** - Automatically stores JWT token from login response
3. **Chains tests** - Passes data between tests (token, post ID, etc.)
4. **Validates responses** - Checks HTTP status codes and response structure
5. **Uses colors** - Color-coded console output for easy reading

## Test Flow Example

When running `testAllRoutes`:

```
1. testSignup → Creates user
2. testLogin → Gets JWT token
3. testGetUser → Verifies user exists
4. testLoginWithWrongPassword → Tests security
5. testListPosts → Tests public route
6. testCreatePost → Tests protected route (uses token from step 2)
7. testGetPost → Tests public route (uses post ID from step 6)
8. testUpdatePost → Tests protected route (uses token & post ID)
9. testDeletePost → Tests protected route (uses token & post ID)
10. testCreatePostWithoutAuth → Tests security (should fail)
11. testUpdatePostWithoutAuth → Tests security (should fail)
12. testDeletePostWithoutAuth → Tests security (should fail)
```

## Key Features

✅ **Automatic Token Management** - Stores JWT token from login and uses it for protected routes
✅ **Colored Output** - Easy to spot failures with green/red console output
✅ **Protected Route Testing** - Full coverage of authentication requirements
✅ **Error Handling** - Graceful handling of network/API errors
✅ **Security Testing** - Tests both success and failure scenarios
✅ **Individual Test Running** - Run single tests or full suite

## Troubleshooting

**"Server is not ready" error:**

- Make sure the server is running with `npm run dev`
- Wait 2-3 seconds after starting server before running tests

**"No authentication token" error:**

- Run `testLogin` before running protected route tests
- Or run `testAllRoutes` which handles the setup automatically

**Connection refused:**

- Verify the server is running on `http://localhost:8080`
- Check that `API_BASE_URL` in the script matches your server address
