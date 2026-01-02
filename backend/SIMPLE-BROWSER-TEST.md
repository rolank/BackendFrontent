# Simple Browser Console Test Script

Just copy and paste sections into your browser console. No functions, no complexity.

## Quick Start

1. **Start the server:**

   ```bash
   npm run dev
   ```

2. **Open browser console:**
   - Press `F12`
   - Go to **Console** tab

3. **Copy and paste the script:**
   - Open `simple-browser-test.js`
   - Copy the entire content
   - Paste into browser console
   - Press Enter

## What Each Section Does

### USER SIGNUP

```javascript
const res1 = await fetch(`${API}/user/signup`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    username: "rol",
    email: "rol@example.com",
    password: "P@ssw0rd2012",
  }),
});
console.log("SIGNUP:", await res1.json());
```

Creates a new user account.

### USER LOGIN

```javascript
const res2 = await fetch(`${API}/user/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    username: "rol",
    password: "P@ssw0rd2012",
  }),
});
const loginData = await res2.json();
const token = loginData.token;
```

Logs in and gets JWT token. Saves token for protected routes.

### GET USER

```javascript
const res3 = await fetch(`${API}/user/rol`, {
  method: "GET",
  headers: { "Content-Type": "application/json" },
});
console.log("GET USER:", await res3.json());
```

Retrieves user by username (public route).

### LIST POSTS (Public)

```javascript
const res4 = await fetch(`${API}/posts`, {
  method: "GET",
  headers: { "Content-Type": "application/json" },
});
console.log("LIST POSTS:", await res4.json());
```

Lists all posts. No authentication needed.

### CREATE POST (Protected)

```javascript
const res5 = await fetch(`${API}/posts`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    title: "My First Post",
    author: "rol",
    contents: "This is my first blog post",
    tags: ["first", "blog"],
  }),
});
const postData = await res5.json();
const postId = postData._id;
```

Creates a post. **Requires token from login**.

### GET SINGLE POST (Public)

```javascript
const res6 = await fetch(`${API}/posts/${postId}`, {
  method: "GET",
  headers: { "Content-Type": "application/json" },
});
console.log("GET POST:", await res6.json());
```

Gets a specific post. No authentication needed.

### UPDATE POST (Protected)

```javascript
const res7 = await fetch(`${API}/posts/${postId}`, {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    title: "Updated Post Title",
    author: "rol",
    contents: "This post has been updated",
    tags: ["updated", "blog"],
  }),
});
console.log("UPDATE POST:", await res7.json());
```

Updates a post. **Requires token**.

### DELETE POST (Protected)

```javascript
const res8 = await fetch(`${API}/posts/${postId}`, {
  method: "DELETE",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
});
console.log("DELETE POST Status:", res8.status);
```

Deletes a post. **Requires token**. Returns 204 on success.

### SECURITY TESTS

Tests that should fail:

**Create post without token (should fail):**

```javascript
const res9 = await fetch(`${API}/posts`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    title: "Unauthorized Post",
    author: "rol",
    contents: "This should fail",
    tags: ["test"],
  }),
});
console.log("CREATE POST WITHOUT AUTH (should fail):", await res9.json());
// Expected: 401 Unauthorized
```

**Login with wrong password (should fail):**

```javascript
const res10 = await fetch(`${API}/user/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    username: "rol",
    password: "WrongPassword",
  }),
});
console.log("LOGIN WITH WRONG PASSWORD (should fail):", await res10.json());
// Expected: 401 Invalid username or password
```

**Get nonexistent user (should fail):**

```javascript
const res11 = await fetch(`${API}/user/nonexistent`, {
  method: "GET",
  headers: { "Content-Type": "application/json" },
});
console.log("GET NONEXISTENT USER (should fail):", await res11.json());
// Expected: 404 User not found
```

## How to Run Individual Sections

You can run any section independently:

1. Copy just the section you want
2. Paste into console
3. Press Enter

Example - just test login:

```javascript
const API = "http://localhost:8080/api/v1";

const res = await fetch(`${API}/user/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    username: "rol",
    password: "P@ssw0rd2012",
  }),
});
console.log(await res.json());
```

## Important Notes

- Change `username` and `password` to match your test user
- The script uses `const` variables, so you can run it multiple times
- Variable names like `token` and `postId` are reused, so run sections in order
- Check console for error messages if something fails

## Example Console Output

```
SIGNUP: {_id: '...', username: 'rol', email: 'rol@example.com'}
LOGIN: {user: {...}, token: 'eyJhbGc...'}
Token: eyJhbGc...
GET USER: {username: 'rol', email: 'rol@example.com', ...}
LIST POSTS: [{...}, {...}, ...]
CREATE POST: {_id: '...', title: 'My First Post', ...}
Post ID: ...
GET POST: {_id: '...', title: 'My First Post', ...}
UPDATE POST: {_id: '...', title: 'Updated Post Title', ...}
DELETE POST Status: 204
CREATE POST WITHOUT AUTH: {error: 'Unauthorized'}
LOGIN WITH WRONG PASSWORD: {error: 'Invalid username or password'}
GET NONEXISTENT USER: {error: 'User not found'}
```

## Tips

- Copy the entire script at once for a complete workflow
- Or copy individual sections to test specific endpoints
- Use `console.clear()` to clear the console if it gets messy
- Check the `Network` tab in DevTools to see the actual HTTP requests
- Modify the body data to test with different values
