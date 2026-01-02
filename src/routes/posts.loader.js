import { API_BASE_URL } from "../config/api.js";
import { getAuthHeaders } from "../utils/auth.js";

/**
 * Loader for blog home page with React Query integration
 * Fetches posts with optional filtering and sorting
 */
export function postsLoader(queryClient) {
  return async ({ request }) => {
    const url = new URL(request.url);
    const author = url.searchParams.get("author") || "";
    const sortBy = url.searchParams.get("sortBy") || "createdAt";
    const sortOrder = url.searchParams.get("sortOrder") || "descending";

    const queryKey = ["posts", { author, sortBy, sortOrder }];

    try {
      const posts = await queryClient.fetchQuery({
        queryKey,
        queryFn: async () => {
          const response = await fetch(
            `${API_BASE_URL}/posts?author=${author}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
            {
              headers: {
                "Content-Type": "application/json",
              },
            },
          );

          if (!response.ok) {
            throw new Error("Failed to fetch posts");
          }

          return response.json();
        },
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
      });

      return { posts, filters: { author, sortBy, sortOrder } };
    } catch (error) {
      throw new Error(`Failed to load posts: ${error.message}`);
    }
  };
}

/**
 * Loader for single post view with React Query integration
 */
export function postLoader(queryClient) {
  return async ({ params }) => {
    const { postId } = params;

    const queryKey = ["post", postId];

    try {
      const post = await queryClient.fetchQuery({
        queryKey,
        queryFn: async () => {
          const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error("Post not found");
          }

          return response.json();
        },
        staleTime: 1000 * 60 * 5,
      });

      return { post };
    } catch (error) {
      throw new Error(`Failed to load post: ${error.message}`);
    }
  };
}
