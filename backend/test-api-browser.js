/**
 * API Testing Script for Browser Console
 *
 * Copy and paste this entire script into your browser console (F12 > Console tab)
 * Then run tests like:
 *   testAllRoutes()
 *   testLogin()
 *   testCreatePost()
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_BASE_URL = "http://localhost:8080/api/v1";

// Test data
let testToken = null;
let testUsername = `testuser_${Date.now()}`;
let testUserPassword = "TestPassword123!";
let testPostId = null;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Color styles for console
const styles = {
  header: "color: #0066cc; font-size: 16px; font-weight: bold;",
  success: "color: #28a745; font-weight: bold; font-size: 14px;",
  error: "color: #dc3545; font-weight: bold; font-size: 14px;",
  info: "color: #17a2b8; font-weight: bold;",
  request: "color: #6c757d;",
  response: "color: #495057; font-family: monospace;",
  section:
    "color: #0066cc; font-size: 14px; font-weight: bold; border-bottom: 2px solid #0066cc; padding-bottom: 5px;",
};

// Helper function to log with colors
function logHeader(message) {
  console.log(`%c${message}`, styles.header);
}

function logSuccess(message) {
  console.log(`%c✓ ${message}`, styles.success);
}

function logError(message) {
  console.log(`%c✗ ${message}`, styles.error);
}

function logInfo(message) {
  console.log(`%c${message}`, styles.info);
}

function logSection(message) {
  console.log(`%c${message}`, styles.section);
}

function logRequest(method, endpoint, body = null, token = null) {
  console.log(`%c${method} ${endpoint}`, styles.request);
  if (body) {
    console.log("Body:", body);
  }
  if (token) {
    console.log("Authorization:", `Bearer ${token.substring(0, 30)}...`);
  }
}

function logResponse(status, data) {
  const statusColor =
    status >= 200 && status < 300 ? styles.success : styles.error;
  console.log(`%cStatus: ${status}`, statusColor);
  console.log("Response:", data);
}

// Helper function to make API requests
async function apiRequest(endpoint, method = "GET", body = null, token = null) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 0, error: error.message };
  }
}

// ============================================================================
// USER AUTHENTICATION TESTS
// ============================================================================

async function testSignup() {
  logSection("USER SIGNUP TEST");
  logInfo(`Creating user: ${testUsername}`);

  const signupData = {
    username: testUsername,
    email: `${testUsername}@example.com`,
    password: testUserPassword,
  };

  logRequest("POST", "/user/signup", signupData);
  const res = await apiRequest("/user/signup", "POST", signupData);
  logResponse(res.status, res.data);

  if (res.status === 201) {
    logSuccess("User signup successful!");
    return true;
  } else {
    logError("User signup failed!");
    return false;
  }
}

async function testLogin() {
  logSection("USER LOGIN TEST");
  logInfo(`Logging in as: ${testUsername}`);

  const loginData = {
    username: testUsername,
    password: testUserPassword,
  };

  logRequest("POST", "/user/login", loginData);
  const res = await apiRequest("/user/login", "POST", loginData);
  logResponse(res.status, res.data);

  if (res.status === 200) {
    testToken = res.data.token;
    logSuccess("Login successful!");
    logInfo(`Token: ${testToken.substring(0, 50)}...`);
    return true;
  } else {
    logError("Login failed!");
    return false;
  }
}

async function testLoginWithWrongPassword() {
  logSection("LOGIN WITH WRONG PASSWORD TEST");

  const loginData = {
    username: testUsername,
    password: "WrongPassword123!",
  };

  logRequest("POST", "/user/login", loginData);
  const res = await apiRequest("/user/login", "POST", loginData);
  logResponse(res.status, res.data);

  if (res.status === 401) {
    logSuccess("Correctly rejected wrong password!");
    return true;
  } else {
    logError("Should have rejected wrong password!");
    return false;
  }
}

async function testGetUser() {
  logSection("GET USER TEST");
  logInfo(`Fetching user: ${testUsername}`);

  logRequest("GET", `/user/${testUsername}`);
  const res = await apiRequest(`/user/${testUsername}`);
  logResponse(res.status, res.data);

  if (res.status === 200) {
    logSuccess("User retrieved successfully!");
    return true;
  } else {
    logError("Failed to retrieve user!");
    return false;
  }
}

// ============================================================================
// POSTS TESTS (PUBLIC ROUTES)
// ============================================================================

async function testListPosts() {
  logSection("LIST POSTS TEST (PUBLIC)");
  logInfo("Fetching all posts...");

  logRequest("GET", "/posts");
  const res = await apiRequest("/posts");
  logResponse(res.status, res.data);

  if (res.status === 200) {
    logSuccess(`Retrieved ${res.data.length} posts`);
    return true;
  } else {
    logError("Failed to list posts!");
    return false;
  }
}

async function testGetPost() {
  logSection("GET SINGLE POST TEST (PUBLIC)");

  if (!testPostId) {
    logError("No post ID! Run testCreatePost first.");
    return false;
  }

  logInfo(`Fetching post: ${testPostId}`);

  logRequest("GET", `/posts/${testPostId}`);
  const res = await apiRequest(`/posts/${testPostId}`);
  logResponse(res.status, res.data);

  if (res.status === 200) {
    logSuccess("Post retrieved successfully!");
    return true;
  } else {
    logError("Failed to retrieve post!");
    return false;
  }
}

// ============================================================================
// POSTS TESTS (PROTECTED ROUTES)
// ============================================================================

async function testCreatePost() {
  logSection("CREATE POST TEST (PROTECTED)");

  if (!testToken) {
    logError("No authentication token! Run testLogin first.");
    return false;
  }

  const postData = {
    title: `Test Post ${Date.now()}`,
    author: testUsername,
    contents: "This is a test post created from browser console",
    tags: ["test", "browser", "console"],
  };

  logInfo("Creating new post with authentication...");
  logRequest("POST", "/posts", postData, testToken);
  const res = await apiRequest("/posts", "POST", postData, testToken);
  logResponse(res.status, res.data);

  if (res.status === 201) {
    testPostId = res.data._id;
    logSuccess("Post created successfully!");
    logInfo(`Post ID: ${testPostId}`);
    return true;
  } else {
    logError("Failed to create post!");
    return false;
  }
}

async function testCreatePostWithoutAuth() {
  logSection("CREATE POST WITHOUT AUTH TEST");

  const postData = {
    title: "Unauthorized Post",
    author: testUsername,
    contents: "This should fail",
    tags: ["test"],
  };

  logInfo("Attempting to create post WITHOUT authentication...");
  logRequest("POST", "/posts", postData, null);
  const res = await apiRequest("/posts", "POST", postData);
  logResponse(res.status, res.data);

  if (res.status === 401) {
    logSuccess("Correctly rejected unauthenticated request!");
    return true;
  } else {
    logError("Should have rejected unauthenticated request!");
    return false;
  }
}

async function testUpdatePost() {
  logSection("UPDATE POST TEST (PROTECTED)");

  if (!testToken) {
    logError("No authentication token! Run testLogin first.");
    return false;
  }

  if (!testPostId) {
    logError("No post ID! Run testCreatePost first.");
    return false;
  }

  const updateData = {
    title: `Updated Post ${Date.now()}`,
    author: testUsername,
    contents: "This post has been updated from browser console",
    tags: ["test", "updated"],
  };

  logInfo(`Updating post: ${testPostId}`);
  logRequest("PATCH", `/posts/${testPostId}`, updateData, testToken);
  const res = await apiRequest(
    `/posts/${testPostId}`,
    "PATCH",
    updateData,
    testToken,
  );
  logResponse(res.status, res.data);

  if (res.status === 200) {
    logSuccess("Post updated successfully!");
    return true;
  } else {
    logError("Failed to update post!");
    return false;
  }
}

async function testUpdatePostWithoutAuth() {
  logSection("UPDATE POST WITHOUT AUTH TEST");

  if (!testPostId) {
    logError("No post ID! Run testCreatePost first.");
    return false;
  }

  const updateData = {
    title: "Unauthorized Update",
    author: testUsername,
    contents: "This should fail",
    tags: ["test"],
  };

  logInfo(`Attempting to update post WITHOUT authentication: ${testPostId}`);
  logRequest("PATCH", `/posts/${testPostId}`, updateData, null);
  const res = await apiRequest(`/posts/${testPostId}`, "PATCH", updateData);
  logResponse(res.status, res.data);

  if (res.status === 401) {
    logSuccess("Correctly rejected unauthenticated request!");
    return true;
  } else {
    logError("Should have rejected unauthenticated request!");
    return false;
  }
}

async function testDeletePost() {
  logSection("DELETE POST TEST (PROTECTED)");

  if (!testToken) {
    logError("No authentication token! Run testLogin first.");
    return false;
  }

  if (!testPostId) {
    logError("No post ID! Run testCreatePost first.");
    return false;
  }

  logInfo(`Deleting post: ${testPostId}`);
  logRequest("DELETE", `/posts/${testPostId}`, null, testToken);
  const res = await apiRequest(
    `/posts/${testPostId}`,
    "DELETE",
    null,
    testToken,
  );
  logResponse(res.status, res.data);

  if (res.status === 204) {
    logSuccess("Post deleted successfully!");
    return true;
  } else {
    logError("Failed to delete post!");
    return false;
  }
}

async function testDeletePostWithoutAuth() {
  logSection("DELETE POST WITHOUT AUTH TEST");

  if (!testPostId) {
    logError("No post ID! Run testCreatePost first.");
    return false;
  }

  logInfo(`Attempting to delete post WITHOUT authentication: ${testPostId}`);
  logRequest("DELETE", `/posts/${testPostId}`, null, null);
  const res = await apiRequest(`/posts/${testPostId}`, "DELETE");
  logResponse(res.status, res.data);

  if (res.status === 401) {
    logSuccess("Correctly rejected unauthenticated request!");
    return true;
  } else {
    logError("Should have rejected unauthenticated request!");
    return false;
  }
}

// ============================================================================
// COMPLETE TEST SUITE
// ============================================================================

async function testAllRoutes() {
  logHeader("\n╔═══════════════════════════════════════════╗");
  logHeader("║     COMPLETE API TEST SUITE (BROWSER)     ║");
  logHeader("╚═══════════════════════════════════════════╝\n");

  const results = [];

  // User tests
  console.log("\n--- User Authentication Tests ---");
  results.push({ name: "User Signup", passed: await testSignup() });
  results.push({ name: "User Login", passed: await testLogin() });
  results.push({ name: "Get User", passed: await testGetUser() });
  results.push({
    name: "Login with Wrong Password",
    passed: await testLoginWithWrongPassword(),
  });

  // Public post tests
  console.log("\n--- Public Post Tests ---");
  results.push({ name: "List Posts (Public)", passed: await testListPosts() });
  results.push({
    name: "Create Post (Protected)",
    passed: await testCreatePost(),
  });
  results.push({
    name: "Get Single Post (Public)",
    passed: await testGetPost(),
  });

  // Protected post tests
  console.log("\n--- Protected Post Tests ---");
  results.push({
    name: "Update Post (Protected)",
    passed: await testUpdatePost(),
  });
  results.push({
    name: "Delete Post (Protected)",
    passed: await testDeletePost(),
  });

  // Security tests
  console.log("\n--- Security Tests (Should Fail) ---");
  results.push({
    name: "Create Post Without Auth (Should Fail)",
    passed: await testCreatePostWithoutAuth(),
  });
  results.push({
    name: "Update Post Without Auth (Should Fail)",
    passed: await testUpdatePostWithoutAuth(),
  });
  results.push({
    name: "Delete Post Without Auth (Should Fail)",
    passed: await testDeletePostWithoutAuth(),
  });

  // Summary
  console.log("\n");
  logHeader("╔═══════════════════════════════════════════╗");
  logHeader("║        TEST SUMMARY                       ║");
  logHeader("╚═══════════════════════════════════════════╝\n");

  const passed = results.filter((r) => r.passed).length;
  const failed = results.length - passed;

  results.forEach((result) => {
    const style = result.passed ? styles.success : styles.error;
    console.log(`%c${result.passed ? "✓" : "✗"} ${result.name}`, style);
  });

  console.log("\n");
  logInfo(`Total: ${passed} passed, ${failed} failed out of ${results.length}`);
  console.log("\n");
}

// ============================================================================
// QUICK REFERENCE
// ============================================================================

function showHelp() {
  console.clear();
  logHeader("API Testing - Browser Console Guide");
  console.log(
    `
%c📋 AVAILABLE TESTS:

User Authentication:
  testSignup()                    - Create new user
  testLogin()                     - Login and get token
  testGetUser()                   - Get user by username
  testLoginWithWrongPassword()    - Test security (wrong password)

Public Routes:
  testListPosts()                 - List all posts
  testGetPost()                   - Get single post

Protected Routes (with auth):
  testCreatePost()                - Create post (requires testLogin first)
  testUpdatePost()                - Update post (requires testCreatePost first)
  testDeletePost()                - Delete post (requires testCreatePost first)

Security Tests (should fail):
  testCreatePostWithoutAuth()     - Try to create without token
  testUpdatePostWithoutAuth()     - Try to update without token
  testDeletePostWithoutAuth()     - Try to delete without token

Complete Suite:
  testAllRoutes()                 - Run all tests in sequence

Help:
  showHelp()                      - Show this message

%c🔑 Global Variables:
  testToken                       - Current JWT token
  testUsername                    - Current test username
  testPostId                      - Current test post ID

%c📝 QUICK START:
  1. Open DevTools (F12)
  2. Go to Console tab
  3. Copy entire script and paste into console
  4. Run: testAllRoutes()
`,
    styles.info,
    styles.info,
    styles.info,
  );
}

// Show help on load
showHelp();
