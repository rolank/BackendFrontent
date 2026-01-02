# Browser Console API Testing Guide

Test your backend API directly from the browser console without any build tools or Node.js!

## Quick Start

### 1. Start your server

```bash
npm run dev
```

### 2. Open Browser Developer Tools

Press `F12` or right-click → **Inspect** → **Console tab**

### 3. Copy and Paste the Test Script

Go to `/backend/test-api-browser.js`, copy the entire contents, and paste into browser console.

### 4. Run Tests

```javascript
// Run all tests
testAllRoutes();

// Or run individual tests
testLogin();
testCreatePost();
testDeletePost();
```

## Available Tests

### User Authentication

```javascript
testSignup(); // Create new user
testLogin(); // Login and get JWT token
testGetUser(); // Retrieve user by username
testLoginWithWrongPassword(); // Test security (should fail)
```

### Public Routes (No Auth Required)

```javascript
testListPosts(); // GET /posts - List all posts
testGetPost(); // GET /posts/:id - Get single post
```

### Protected Routes (Require JWT Token)

```javascript
testCreatePost(); // POST /posts - Create post (authenticated)
testUpdatePost(); // PATCH /posts/:id - Update post (authenticated)
testDeletePost(); // DELETE /posts/:id - Delete post (authenticated)
```

### Security Tests (Should Fail)

```javascript
testCreatePostWithoutAuth(); // POST /posts without token → 401
testUpdatePostWithoutAuth(); // PATCH /posts/:id without token → 401
testDeletePostWithoutAuth(); // DELETE /posts/:id without token → 401
```

### Complete Suite

```javascript
testAllRoutes(); // Run all 12 tests in sequence
```

### Help

```javascript
showHelp(); // Display this guide in console
```

## Example Output

When you run `testLogin()`, you'll see:

```
USER LOGIN TEST
Logging in as: testuser_1702207800123

POST /user/login
Body: {username: 'testuser_1702207800123', password: 'TestPassword123!'}

✓ Status: 200
Response: {
  user: {
    _id: '6576a1b2c3d4e5f6g7h8i9j0',
    username: 'testuser_1702207800123',
    email: 'testuser_1702207800123@example.com'
  },
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
}

✓ Login successful!
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9Tk1VlE...
```

## Global Variables

After running tests, these variables are available:

```javascript
testToken; // JWT token from login (use for protected routes)
testUsername; // Username of test user (use for creating posts)
testPostId; // ID of created post (use for update/delete tests)
```

## Test Flow Example

Here's how to manually run through a complete workflow:

```javascript
// 1. Create an account
await testSignup();

// 2. Login and get token
await testLogin();

// 3. Create a post (now that we have a token)
await testCreatePost();

// 4. View the created post
await testGetPost();

// 5. Update the post
await testUpdatePost();

// 6. Delete the post
await testDeletePost();

// 7. Try to delete again (should fail with 404)
await testDeletePost();
```

## Testing Protected Routes

Protected routes require authentication. Here's how it works:

```javascript
// First, login to get a token
await testLogin();
// Token is now stored in: testToken

// Create a post (uses testToken automatically)
await testCreatePost();
// Post ID is now stored in: testPostId

// Update the post (uses testToken automatically)
await testUpdatePost();

// Delete the post (uses testToken automatically)
await testDeletePost();
```

## Testing Authentication Failures

Verify that protected routes properly reject unauthenticated requests:

```javascript
// Try to create post WITHOUT logging in first
// (testToken will be null)
testToken = null;
await testCreatePostWithoutAuth(); // Should return 401

// Try to update without auth
await testUpdatePostWithoutAuth(); // Should return 401

// Try to delete without auth
await testDeletePostWithoutAuth(); // Should return 401
```

## Troubleshooting

### "CORS Error" or "Failed to fetch"

- Make sure your server is running (`npm run dev`)
- Check that API_BASE_URL is correct: `http://localhost:8080/api/v1`
- Verify CORS is enabled on the server

### "No authentication token"

- Run `testLogin()` first, or
- Run `testAllRoutes()` which handles the sequence automatically

### "No post ID"

- Run `testCreatePost()` first to create a post, or
- Run `testAllRoutes()` which does this in order

### Console is confusing with all the output

- Clear console: `console.clear()`
- Then run a single test: `testLogin()`

## Color Legend

| Color        | Meaning                         |
| ------------ | ------------------------------- |
| 🔵 Blue      | Section headers and information |
| 🟢 Green     | Success messages (✓)            |
| 🔴 Red       | Error messages (✗)              |
| ⚫ Gray      | Request details                 |
| ⚫ Dark Gray | Response data                   |

## Keyboard Shortcuts

In the browser console:

| Shortcut           | Action                   |
| ------------------ | ------------------------ |
| `↑` / `↓`          | Navigate command history |
| `Ctrl+L` / `Cmd+K` | Clear console            |
| `Ctrl+Shift+K`     | Clear console (Firefox)  |
| `Escape`           | Close autocomplete       |

## Pro Tips

1. **Save commonly used commands:**

   ```javascript
   // Create a reusable login and create post flow
   async function quickTest() {
     await testSignup();
     await testLogin();
     await testCreatePost();
   }
   quickTest();
   ```

2. **Check the token:**

   ```javascript
   console.log(testToken);
   ```

3. **Check the post ID:**

   ```javascript
   console.log(testPostId);
   ```

4. **View all test data:**

   ```javascript
   console.log({ testToken, testUsername, testPostId });
   ```

5. **Run tests and capture results:**
   ```javascript
   const results = await testAllRoutes();
   console.table(results);
   ```

## What's Being Tested?

### Security

- ✅ JWT authentication required for POST/PATCH/DELETE
- ✅ Password validation works
- ✅ Wrong passwords are rejected
- ✅ Requests without tokens get 401

### Data Validation

- ✅ Required fields enforced
- ✅ Invalid IDs return 400
- ✅ Nonexistent resources return 404

### CRUD Operations

- ✅ Create posts (POST)
- ✅ Read posts (GET)
- ✅ Update posts (PATCH)
- ✅ Delete posts (DELETE)

### Public vs Protected

- ✅ GET endpoints are public
- ✅ POST/PATCH/DELETE require auth
