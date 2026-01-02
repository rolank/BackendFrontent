// ============================================================================
// SIMPLE BROWSER CONSOLE TEST SCRIPT
// Copy and paste individual sections into browser console (F12)
// ============================================================================

// API Base URL
const API = "http://localhost:8080/api/v1";

// ============================================================================
// USER SIGNUP
// ============================================================================
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

// ============================================================================
// USER LOGIN
// ============================================================================
const res2 = await fetch(`${API}/user/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    username: "rol",
    password: "P@ssw0rd2012",
  }),
});
const loginData = await res2.json();
console.log("LOGIN:", loginData);

// Store token for later use
const token = loginData.token;
console.log("Token:", token);

// ============================================================================
// GET USER BY USERNAME
// ============================================================================
const res3 = await fetch(`${API}/user/rol`, {
  method: "GET",
  headers: { "Content-Type": "application/json" },
});
console.log("GET USER:", await res3.json());

// ============================================================================
// LIST ALL POSTS (PUBLIC)
// ============================================================================
const res4 = await fetch(`${API}/posts`, {
  method: "GET",
  headers: { "Content-Type": "application/json" },
});
console.log("LIST POSTS:", await res4.json());

// ============================================================================
// CREATE POST (PROTECTED - REQUIRES TOKEN)
// ============================================================================
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
console.log("CREATE POST:", postData);

// Store post ID for later use
const postId = postData._id;
console.log("Post ID:", postId);

// ============================================================================
// GET SINGLE POST (PUBLIC)
// ============================================================================
const res6 = await fetch(`${API}/posts/${postId}`, {
  method: "GET",
  headers: { "Content-Type": "application/json" },
});
console.log("GET POST:", await res6.json());

// ============================================================================
// UPDATE POST (PROTECTED - REQUIRES TOKEN)
// ============================================================================
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

// ============================================================================
// DELETE POST (PROTECTED - REQUIRES TOKEN)
// ============================================================================
const res8 = await fetch(`${API}/posts/${postId}`, {
  method: "DELETE",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
});
console.log("DELETE POST Status:", res8.status);
if (res8.status !== 204) {
  console.log("DELETE POST Response:", await res8.json());
} else {
  console.log("DELETE POST: Success (204 No Content)");
}

// ============================================================================
// TEST: CREATE POST WITHOUT AUTHENTICATION (SHOULD FAIL)
// ============================================================================
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

// ============================================================================
// TEST: LOGIN WITH WRONG PASSWORD (SHOULD FAIL)
// ============================================================================
const res10 = await fetch(`${API}/user/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    username: "rol",
    password: "WrongPassword",
  }),
});
console.log("LOGIN WITH WRONG PASSWORD (should fail):", await res10.json());

// ============================================================================
// TEST: GET NONEXISTENT USER (SHOULD FAIL)
// ============================================================================
const res11 = await fetch(`${API}/user/nonexistent`, {
  method: "GET",
  headers: { "Content-Type": "application/json" },
});
console.log("GET NONEXISTENT USER (should fail):", await res11.json());
