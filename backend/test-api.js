/**
 * API Testing Script - Manual Test Cases for Protected Routes
 *
 * This script provides ready-to-use test cases for testing the backend API endpoints.
 * It uses the Fetch API (available in Node.js 18+) to make HTTP requests.
 *
 * Usage:
 * 1. Start the server: npm run dev
 * 2. In another terminal, run individual tests:
 *    node test-api.js testSignup
 *    node test-api.js testLogin
 *    node test-api.js testCreatePost
 *    node test-api.js testAllRoutes
 */

const API_BASE_URL = "http://localhost:8080/api/v1";

// Test data
let testToken = null;
let testUsername = `testuser_${Date.now()}`;
let testUserPassword = "TestPassword123!";
let testPostId = null;

// Color codes for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

// Helper function to log with colors
function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
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
  log("\n=== USER SIGNUP TEST ===", "cyan");
  log(`Testing: POST /user/signup`, "blue");

  const signupData = {
    username: testUsername,
    email: `${testUsername}@example.com`,
    password: testUserPassword,
  };

  log(`Request body: ${JSON.stringify(signupData)}`, "yellow");

  const res = await apiRequest("/user/signup", "POST", signupData);
  log(`Status: ${res.status}`, res.status === 201 ? "green" : "red");
  log(`Response: ${JSON.stringify(res.data, null, 2)}`, "blue");

  if (res.status === 201) {
    log("✓ User signup successful!", "green");
    return true;
  } else {
    log("✗ User signup failed!", "red");
    return false;
  }
}

async function testLogin() {
  log("\n=== USER LOGIN TEST ===", "cyan");
  log(`Testing: POST /user/login`, "blue");

  const loginData = {
    username: testUsername,
    password: testUserPassword,
  };

  log(`Request body: ${JSON.stringify(loginData)}`, "yellow");

  const res = await apiRequest("/user/login", "POST", loginData);
  log(`Status: ${res.status}`, res.status === 200 ? "green" : "red");
  log(`Response: ${JSON.stringify(res.data, null, 2)}`, "blue");

  if (res.status === 200) {
    testToken = res.data.token;
    log("✓ Login successful!", "green");
    log(`Token obtained: ${testToken.substring(0, 20)}...`, "yellow");
    return true;
  } else {
    log("✗ Login failed!", "red");
    return false;
  }
}

async function testLoginWithWrongPassword() {
  log("\n=== LOGIN WITH WRONG PASSWORD TEST ===", "cyan");
  log(`Testing: POST /user/login (with wrong password)`, "blue");

  const loginData = {
    username: testUsername,
    password: "WrongPassword123!",
  };

  log(`Request body: ${JSON.stringify(loginData)}`, "yellow");

  const res = await apiRequest("/user/login", "POST", loginData);
  log(`Status: ${res.status}`, res.status === 401 ? "green" : "red");
  log(`Response: ${JSON.stringify(res.data, null, 2)}`, "blue");

  if (res.status === 401) {
    log("✓ Correctly rejected wrong password!", "green");
    return true;
  } else {
    log("✗ Should have rejected wrong password!", "red");
    return false;
  }
}

async function testGetUser() {
  log("\n=== GET USER TEST ===", "cyan");
  log(`Testing: GET /user/:username`, "blue");

  const res = await apiRequest(`/user/${testUsername}`);
  log(`Status: ${res.status}`, res.status === 200 ? "green" : "red");
  log(`Response: ${JSON.stringify(res.data, null, 2)}`, "blue");

  if (res.status === 200) {
    log("✓ User retrieved successfully!", "green");
    return true;
  } else {
    log("✗ Failed to retrieve user!", "red");
    return false;
  }
}

// ============================================================================
// POSTS TESTS (PROTECTED ROUTES)
// ============================================================================

async function testCreatePost() {
  log("\n=== CREATE POST TEST (PROTECTED) ===", "cyan");
  log(`Testing: POST /posts (requires authentication)`, "blue");

  if (!testToken) {
    log("✗ No authentication token! Run testLogin first.", "red");
    return false;
  }

  const postData = {
    title: `Test Post ${Date.now()}`,
    author: testUsername,
    contents: "This is a test post created via script",
    tags: ["test", "script"],
  };

  log(`Request body: ${JSON.stringify(postData, null, 2)}`, "yellow");
  log(`Authorization: Bearer ${testToken.substring(0, 20)}...`, "yellow");

  const res = await apiRequest("/posts", "POST", postData, testToken);
  log(`Status: ${res.status}`, res.status === 201 ? "green" : "red");
  log(`Response: ${JSON.stringify(res.data, null, 2)}`, "blue");

  if (res.status === 201) {
    testPostId = res.data._id;
    log("✓ Post created successfully!", "green");
    log(`Post ID: ${testPostId}`, "yellow");
    return true;
  } else {
    log("✗ Failed to create post!", "red");
    return false;
  }
}

async function testCreatePostWithoutAuth() {
  log("\n=== CREATE POST WITHOUT AUTH TEST ===", "cyan");
  log(`Testing: POST /posts (without authentication - should fail)`, "blue");

  const postData = {
    title: "Unauthorized Post",
    author: testUsername,
    contents: "This should fail",
    tags: ["test"],
  };

  log(`Request body: ${JSON.stringify(postData, null, 2)}`, "yellow");
  log(`Authorization: (none)`, "yellow");

  const res = await apiRequest("/posts", "POST", postData);
  log(`Status: ${res.status}`, res.status === 401 ? "green" : "red");
  log(`Response: ${JSON.stringify(res.data, null, 2)}`, "blue");

  if (res.status === 401) {
    log("✓ Correctly rejected unauthenticated request!", "green");
    return true;
  } else {
    log("✗ Should have rejected unauthenticated request!", "red");
    return false;
  }
}

async function testListPosts() {
  log("\n=== LIST POSTS TEST (PUBLIC) ===", "cyan");
  log(`Testing: GET /posts (public, no authentication needed)`, "blue");

  const res = await apiRequest("/posts");
  log(`Status: ${res.status}`, res.status === 200 ? "green" : "red");
  log(
    `Response: ${JSON.stringify(res.data, null, 2).substring(0, 200)}...`,
    "blue",
  );

  if (res.status === 200) {
    log(`✓ Retrieved ${res.data.length} posts`, "green");
    return true;
  } else {
    log("✗ Failed to list posts!", "red");
    return false;
  }
}

async function testGetPost() {
  log("\n=== GET SINGLE POST TEST (PUBLIC) ===", "cyan");
  log(`Testing: GET /posts/:id (public, no authentication needed)`, "blue");

  if (!testPostId) {
    log("✗ No post ID! Run testCreatePost first.", "red");
    return false;
  }

  const res = await apiRequest(`/posts/${testPostId}`);
  log(`Status: ${res.status}`, res.status === 200 ? "green" : "red");
  log(`Response: ${JSON.stringify(res.data, null, 2)}`, "blue");

  if (res.status === 200) {
    log("✓ Post retrieved successfully!", "green");
    return true;
  } else {
    log("✗ Failed to retrieve post!", "red");
    return false;
  }
}

async function testUpdatePost() {
  log("\n=== UPDATE POST TEST (PROTECTED) ===", "cyan");
  log(`Testing: PATCH /posts/:id (requires authentication)`, "blue");

  if (!testToken) {
    log("✗ No authentication token! Run testLogin first.", "red");
    return false;
  }

  if (!testPostId) {
    log("✗ No post ID! Run testCreatePost first.", "red");
    return false;
  }

  const updateData = {
    title: `Updated Post ${Date.now()}`,
    author: testUsername,
    contents: "This post has been updated via script",
    tags: ["test", "updated"],
  };

  log(`Request body: ${JSON.stringify(updateData, null, 2)}`, "yellow");
  log(`Authorization: Bearer ${testToken.substring(0, 20)}...`, "yellow");

  const res = await apiRequest(
    `/posts/${testPostId}`,
    "PATCH",
    updateData,
    testToken,
  );
  log(`Status: ${res.status}`, res.status === 200 ? "green" : "red");
  log(`Response: ${JSON.stringify(res.data, null, 2)}`, "blue");

  if (res.status === 200) {
    log("✓ Post updated successfully!", "green");
    return true;
  } else {
    log("✗ Failed to update post!", "red");
    return false;
  }
}

async function testUpdatePostWithoutAuth() {
  log("\n=== UPDATE POST WITHOUT AUTH TEST ===", "cyan");
  log(
    `Testing: PATCH /posts/:id (without authentication - should fail)`,
    "blue",
  );

  if (!testPostId) {
    log("✗ No post ID! Run testCreatePost first.", "red");
    return false;
  }

  const updateData = {
    title: "Unauthorized Update",
    author: testUsername,
    contents: "This should fail",
    tags: ["test"],
  };

  log(`Request body: ${JSON.stringify(updateData, null, 2)}`, "yellow");
  log(`Authorization: (none)`, "yellow");

  const res = await apiRequest(`/posts/${testPostId}`, "PATCH", updateData);
  log(`Status: ${res.status}`, res.status === 401 ? "green" : "red");
  log(`Response: ${JSON.stringify(res.data, null, 2)}`, "blue");

  if (res.status === 401) {
    log("✓ Correctly rejected unauthenticated request!", "green");
    return true;
  } else {
    log("✗ Should have rejected unauthenticated request!", "red");
    return false;
  }
}

async function testDeletePost() {
  log("\n=== DELETE POST TEST (PROTECTED) ===", "cyan");
  log(`Testing: DELETE /posts/:id (requires authentication)`, "blue");

  if (!testToken) {
    log("✗ No authentication token! Run testLogin first.", "red");
    return false;
  }

  if (!testPostId) {
    log("✗ No post ID! Run testCreatePost first.", "red");
    return false;
  }

  log(`Authorization: Bearer ${testToken.substring(0, 20)}...`, "yellow");

  const res = await apiRequest(
    `/posts/${testPostId}`,
    "DELETE",
    null,
    testToken,
  );
  log(`Status: ${res.status}`, res.status === 204 ? "green" : "red");

  if (res.status === 204) {
    log("✓ Post deleted successfully!", "green");
    return true;
  } else {
    log("✗ Failed to delete post!", "red");
    return false;
  }
}

async function testDeletePostWithoutAuth() {
  log("\n=== DELETE POST WITHOUT AUTH TEST ===", "cyan");
  log(
    `Testing: DELETE /posts/:id (without authentication - should fail)`,
    "blue",
  );

  if (!testPostId) {
    log("✗ No post ID! Run testCreatePost first.", "red");
    return false;
  }

  log(`Authorization: (none)`, "yellow");

  const res = await apiRequest(`/posts/${testPostId}`, "DELETE");
  log(`Status: ${res.status}`, res.status === 401 ? "green" : "red");
  log(`Response: ${JSON.stringify(res.data, null, 2)}`, "blue");

  if (res.status === 401) {
    log("✓ Correctly rejected unauthenticated request!", "green");
    return true;
  } else {
    log("✗ Should have rejected unauthenticated request!", "red");
    return false;
  }
}

// ============================================================================
// TEST SUITES
// ============================================================================

async function testAllRoutes() {
  log("\n╔════════════════════════════════════════╗", "cyan");
  log("║   COMPLETE API TEST SUITE              ║", "cyan");
  log("╚════════════════════════════════════════╝", "cyan");

  const results = [];

  results.push({
    name: "User Signup",
    passed: await testSignup(),
  });

  results.push({
    name: "User Login",
    passed: await testLogin(),
  });

  results.push({
    name: "Get User",
    passed: await testGetUser(),
  });

  results.push({
    name: "Login with Wrong Password",
    passed: await testLoginWithWrongPassword(),
  });

  results.push({
    name: "List Posts (Public)",
    passed: await testListPosts(),
  });

  results.push({
    name: "Create Post (Protected)",
    passed: await testCreatePost(),
  });

  results.push({
    name: "Get Single Post (Public)",
    passed: await testGetPost(),
  });

  results.push({
    name: "Update Post (Protected)",
    passed: await testUpdatePost(),
  });

  results.push({
    name: "Delete Post (Protected)",
    passed: await testDeletePost(),
  });

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
  log("\n╔════════════════════════════════════════╗", "cyan");
  log("║   TEST SUMMARY                         ║", "cyan");
  log("╚════════════════════════════════════════╝", "cyan");

  const passed = results.filter((r) => r.passed).length;
  const failed = results.length - passed;

  results.forEach((result) => {
    log(
      `${result.passed ? "✓" : "✗"} ${result.name}`,
      result.passed ? "green" : "red",
    );
  });

  log(
    `\nTotal: ${passed} passed, ${failed} failed out of ${results.length}`,
    "cyan",
  );
}

// ============================================================================
// CLI RUNNER
// ============================================================================

const args = process.argv.slice(2);
const testName = args[0] || "testAllRoutes";

const tests = {
  testSignup,
  testLogin,
  testLoginWithWrongPassword,
  testGetUser,
  testCreatePost,
  testCreatePostWithoutAuth,
  testListPosts,
  testGetPost,
  testUpdatePost,
  testUpdatePostWithoutAuth,
  testDeletePost,
  testDeletePostWithoutAuth,
  testAllRoutes,
};

if (tests[testName]) {
  tests[testName]().catch((err) => {
    log(`Error: ${err.message}`, "red");
    process.exit(1);
  });
} else {
  log(`Available tests:`, "cyan");
  Object.keys(tests).forEach((test) => {
    log(`  node test-api.js ${test}`, "yellow");
  });
}
