export const getPosts = async (queryParams) => {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/posts?${new URLSearchParams(queryParams)}`,
    {
      headers: {
        "contents-Type": "application/json",
      },
    },
  );
  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }
  return response.json();
};

export const createPost = async (post) => {
  console.log("Creating post:", post);
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/posts`, {
    method: "POST",
    headers: {
      "content-Type": "application/json",
    },
    body: JSON.stringify(post),
  });
  if (!response.ok) {
    throw new Error("Failed to create post");
  }
  return response.json();
};
