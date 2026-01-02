// ============================================================================
// LOGIN AND CREATE POST SCRIPT
// Copy and paste into browser console (F12)
// ============================================================================

const API = "http://localhost:8080/api/v1";

// ============================================================================
// STEP 1: LOGIN
// ============================================================================
console.log("🔐 Step 1: Logging in...");

const loginRes = await fetch(`${API}/user/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    username: "rol",
    password: "P@ssw0rd2012",
  }),
});

const loginData = await loginRes.json();
console.log("✓ Login Response:", loginData);

// Extract token
const token = loginData.token;
console.log("✓ Token obtained:", token.substring(0, 50) + "...");

// ============================================================================
// STEP 2: CREATE POST (Using the token from login)
// ============================================================================
console.log("\n📝 Step 2: Creating a post...");

const createRes = await fetch(`${API}/posts`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    title: "My Amazing Blog Post",
    author: "rol",
    contents:
      "This is the content of my amazing blog post. It has multiple paragraphs and interesting information.",
    tags: ["blog", "amazing", "first-post"],
  }),
});

const postData = await createRes.json();
console.log("✓ Post Created:", postData);

// Store post ID for future use
const postId = postData._id;
console.log("✓ Post ID:", postId);

console.log("\n✅ Login and post creation complete!");
console.log("Token:", token);
console.log("Post ID:", postId);
