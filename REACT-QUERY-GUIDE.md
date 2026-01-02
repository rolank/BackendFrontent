# React Query Guide: Complete Understanding

## Table of Contents

1. [What is React Query?](#what-is-react-query)
2. [Core Concepts](#core-concepts)
3. [How React Query Works](#how-react-query-works)
4. [React Query vs React Router](#react-query-vs-react-router)
5. [Key Features & Advantages](#key-features--advantages)
6. [Implementation in This Project](#implementation-in-this-project)
7. [Best Practices](#best-practices)

---

## What is React Query?

**React Query** (TanStack Query) is a powerful **data-fetching and state management library** for React applications. It handles server state (data from APIs) by providing:

- Automatic caching
- Background refetching
- Request deduplication
- Optimistic updates
- Intelligent retry logic

### The Problem It Solves

Without React Query, managing server data requires:

```jsx
// Manual approach (painful!)
const [posts, setPosts] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  setLoading(true);
  fetch("/api/posts")
    .then((res) => res.json())
    .then((data) => {
      setPosts(data);
      setLoading(false);
    })
    .catch((err) => {
      setError(err);
      setLoading(false);
    });
}, []);

// Need to refetch? Write it all again!
// Need caching? Build it yourself!
// Need to sync data across components? Complex!
```

With React Query:

```jsx
// Simple and powerful!
const {
  data: posts,
  isLoading,
  error,
} = useQuery({
  queryKey: ["posts"],
  queryFn: getPosts,
});
// Auto-caching, refetching, and syncing included! ✨
```

---

## Core Concepts

### 1. **QueryClient**

The **brain** of React Query. It manages all queries and their cache.

```jsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false, // Don't refetch on window focus
      retry: 1, // Retry failed requests once
    },
  },
});
```

**Configuration Options:**

- `staleTime`: How long data is considered "fresh" (no refetch needed)
- `cacheTime`: How long unused data stays in cache
- `refetchOnWindowFocus`: Auto-refetch when user returns to tab
- `retry`: Number of retry attempts for failed requests

**Why wrap your app?**

```jsx
<QueryClientProvider client={queryClient}>
  <App /> {/* All components can now use React Query hooks */}
</QueryClientProvider>
```

---

### 2. **Query Key**

A **unique identifier** for each query. React Query uses it to:

- Cache data
- Track query status
- Invalidate/refetch specific queries

```jsx
// Simple key
queryKey: ["posts"];

// Key with parameters (for filtering/sorting)
queryKey: ["posts", { author: "john", sortBy: "date" }];

// Nested key for specific item
queryKey: ["post", postId];
```

**Key Rules:**

- Must be an array
- First element is usually a string identifier
- Additional elements can be objects, strings, numbers
- Same key = same cache entry

**Example:**

```jsx
// These are DIFFERENT queries (different cache entries)
["posts"][("posts", { author: "john" })][("posts", { author: "jane" })][ // All posts // John's posts // Jane's posts
  ("post", "123")
]; // Specific post #123
```

---

### 3. **useQuery Hook**

Fetches data and manages its lifecycle.

```jsx
const { data, isLoading, isError, error, refetch } = useQuery({
  queryKey: ["posts"],
  queryFn: fetchPosts,
  staleTime: 1000 * 60 * 5, // Optional: override default
  enabled: true, // Can disable query conditionally
});
```

**Return Values:**

- `data`: The fetched data
- `isLoading`: True during first fetch
- `isFetching`: True during any fetch (including background)
- `isError`: True if query failed
- `error`: Error object if failed
- `refetch()`: Manually trigger refetch

**Example Usage:**

```jsx
function PostList() {
  const {
    data: posts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const response = await fetch("/api/posts");
      if (!response.ok) throw new Error("Failed to fetch");
      return response.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

---

### 4. **useMutation Hook**

Handles data modifications (POST, PUT, DELETE).

```jsx
const mutation = useMutation({
  mutationFn: createPost,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["posts"] });
  },
});

// Trigger mutation
mutation.mutate({ title: "New Post", content: "..." });
```

**Why use mutations?**

- Track loading/error states
- Optimistic updates
- Automatic cache invalidation
- Rollback on error

---

### 5. **Cache Invalidation**

Tell React Query to **refetch** data after changes.

```jsx
// After creating a post, refetch all posts
await queryClient.invalidateQueries({ queryKey: ["posts"] });

// Remove specific query from cache
queryClient.removeQueries({ queryKey: ["post", postId] });

// Manually set data in cache
queryClient.setQueryData(["posts"], newPostsData);
```

---

## How React Query Works

### Data Flow Diagram

```
┌─────────────┐
│  Component  │
│  renders    │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│  useQuery hook   │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐      ┌──────────────┐
│  Check cache     │─────>│ Cache exists │
│  (QueryClient)   │      │ & fresh?     │
└──────────────────┘      └──────┬───────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                  YES                        NO
                    │                         │
                    ▼                         ▼
            ┌───────────────┐       ┌──────────────┐
            │ Return cached │       │ Fetch new    │
            │ data instantly│       │ data from API│
            └───────────────┘       └──────┬───────┘
                                           │
                                           ▼
                                  ┌────────────────┐
                                  │ Update cache   │
                                  │ Return data    │
                                  └────────────────┘
```

### Cache States

1. **Fresh** → Data just fetched, no refetch needed
2. **Stale** → Data old, but still usable (background refetch may occur)
3. **Inactive** → No component using this query
4. **Garbage Collected** → Removed from memory after `cacheTime`

---

## React Query vs React Router

### React Router Loaders

**How it works:**

```jsx
// Loader runs BEFORE route renders
export async function postsLoader() {
  const posts = await fetch('/api/posts').then(r => r.json());
  return { posts };
}

// Route config
{ path: '/', Component: HomePage, loader: postsLoader }

// Component gets data immediately
function HomePage() {
  const { posts } = useLoaderData(); // ✅ Data already here
  return <PostList posts={posts} />;
}
```

**Characteristics:**

- ✅ Data loads **before** navigation completes
- ✅ No loading states in component
- ✅ Works with React Router's navigation
- ❌ No automatic caching
- ❌ No background refetching
- ❌ Manual cache invalidation needed

---

### React Query (Standalone)

**How it works:**

```jsx
// Component renders first, then fetches
function HomePage() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });

  if (isLoading) return <Spinner />; // ⏳ Must handle loading
  return <PostList posts={posts} />;
}
```

**Characteristics:**

- ✅ Automatic caching & deduplication
- ✅ Background refetching
- ✅ Optimistic updates
- ✅ Stale-while-revalidate
- ❌ Data loads **after** navigation
- ❌ Need loading states in component

---

### Combining Both (Best Approach!)

```jsx
// 1. Loader prefetches data into React Query cache
export function postsLoader(queryClient) {
  return async () => {
    await queryClient.fetchQuery({
      queryKey: ["posts"],
      queryFn: fetchPosts,
    });
    return null; // Loader doesn't return data
  };
}

// 2. Component uses React Query (with cached data)
function HomePage() {
  const { data: posts } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
    // Cache hit from loader = instant render!
    // Plus: auto-refetch, cache management, etc.
  });

  return <PostList posts={posts} />;
}
```

**Result: Best of both worlds! 🎉**

- ✅ Fast navigation (loader preloads)
- ✅ Automatic caching
- ✅ Background updates
- ✅ No loading states (uses cached data)

---

## Key Features & Advantages

### 1. **Automatic Caching**

```jsx
// Component A fetches posts
const { data } = useQuery({ queryKey: ["posts"], queryFn: fetchPosts });

// Component B gets same data from cache (no refetch!)
const { data } = useQuery({ queryKey: ["posts"], queryFn: fetchPosts });
```

### 2. **Request Deduplication**

```jsx
// Multiple components request same data simultaneously
// React Query makes only ONE network request
<ComponentA /> // requests 'posts'
<ComponentB /> // requests 'posts'  → Only 1 API call!
<ComponentC /> // requests 'posts'
```

### 3. **Stale-While-Revalidate**

```jsx
// Show old data immediately, fetch new data in background
const { data } = useQuery({
  queryKey: ["posts"],
  queryFn: fetchPosts,
  staleTime: 1000 * 60, // Fresh for 1 minute
});
// User sees data instantly (if cached)
// React Query refetches in background if stale
```

### 4. **Optimistic Updates**

```jsx
const mutation = useMutation({
  mutationFn: updatePost,
  onMutate: async (newPost) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ["posts"] });

    // Snapshot previous value
    const previousPosts = queryClient.getQueryData(["posts"]);

    // Optimistically update cache
    queryClient.setQueryData(["posts"], (old) => [...old, newPost]);

    // Return rollback function
    return { previousPosts };
  },
  onError: (err, newPost, context) => {
    // Rollback on error
    queryClient.setQueryData(["posts"], context.previousPosts);
  },
  onSettled: () => {
    // Refetch to ensure sync
    queryClient.invalidateQueries({ queryKey: ["posts"] });
  },
});
```

### 5. **Automatic Retry**

```jsx
const { data } = useQuery({
  queryKey: ["posts"],
  queryFn: fetchPosts,
  retry: 3, // Retry 3 times
  retryDelay: 1000, // Wait 1s between retries
});
```

### 6. **Background Refetching**

```jsx
const { data, isStale } = useQuery({
  queryKey: ["posts"],
  queryFn: fetchPosts,
  refetchInterval: 5000, // Poll every 5 seconds
  refetchOnWindowFocus: true, // Refetch on tab focus
  refetchOnReconnect: true, // Refetch after reconnect
});
```

---

## Implementation in This Project

### Setup (App.jsx)

```jsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min
      cacheTime: 1000 * 60 * 10, // 10 min
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Pass queryClient to loaders and actions
const router = createBrowserRouter([
  {
    path: "/",
    Component: HomePage,
    loader: postsLoader(queryClient), // ← Inject queryClient
  },
]);
```

### Loader with React Query (posts.loader.js)

```jsx
export function postsLoader(queryClient) {
  return async ({ request }) => {
    const url = new URL(request.url);
    const author = url.searchParams.get("author") || "";
    const sortBy = url.searchParams.get("sortBy") || "createdAt";

    const queryKey = ["posts", { author, sortBy }];

    // Prefetch into React Query cache
    const posts = await queryClient.fetchQuery({
      queryKey,
      queryFn: async () => {
        const response = await fetch(
          `/api/posts?author=${author}&sortBy=${sortBy}`,
        );
        if (!response.ok) throw new Error("Failed to fetch");
        return response.json();
      },
      staleTime: 1000 * 60 * 5,
    });

    return { posts };
  };
}
```

### Component with React Query (HomePage.jsx)

```jsx
import { useQuery } from "@tanstack/react-query";

export function HomePage() {
  const loaderData = useLoaderData();

  // Use React Query with loader data as initialData
  const { data: posts } = useQuery({
    queryKey: ["posts", { author, sortBy }],
    queryFn: fetchPosts,
    initialData: loaderData.posts, // Start with loader data
    staleTime: 1000 * 60 * 5,
  });

  return <PostList posts={posts} />;
}
```

### Actions with Cache Invalidation (posts.action.js)

```jsx
export function createPostAction(queryClient) {
  return async ({ request }) => {
    // ... create post logic ...

    // Invalidate cache to trigger refetch
    await queryClient.invalidateQueries({ queryKey: ["posts"] });

    return redirect("/");
  };
}

export function deletePostAction(queryClient) {
  return async ({ params }) => {
    const { postId } = params;

    // ... delete post logic ...

    // Remove from cache
    queryClient.removeQueries({ queryKey: ["post", postId] });
    await queryClient.invalidateQueries({ queryKey: ["posts"] });

    return redirect("/");
  };
}
```

---

## Best Practices

### 1. **Consistent Query Keys**

```jsx
// ✅ Good: Consistent structure
["posts"][("posts", { author: "john" })][("post", postId)][
  // ❌ Bad: Inconsistent
  "posts"
]["allPosts"]["post-123"];
```

### 2. **Use Separate Keys for Different Data**

```jsx
// ✅ Good: Different keys for different queries
["posts"][("posts", { id })][("post", id)]; // All posts // Specific post (NOT RECOMMENDED) // ✅ Better: Different base key for single item

// Invalidation
queryClient.invalidateQueries({ queryKey: ["posts"] }); // Refetch list
queryClient.invalidateQueries({ queryKey: ["post", id] }); // Refetch single
```

### 3. **Handle Loading & Error States**

```jsx
const { data, isLoading, isError, error } = useQuery({
  queryKey: ["posts"],
  queryFn: fetchPosts,
});

if (isLoading) return <Spinner />;
if (isError) return <ErrorMessage error={error} />;
return <PostList posts={data} />;
```

### 4. **Use Mutations for Write Operations**

```jsx
// ✅ Good: Use useMutation
const mutation = useMutation({
  mutationFn: createPost,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["posts"] });
  },
});

mutation.mutate(newPost);

// ❌ Bad: Manual fetch without cache update
await fetch("/api/posts", { method: "POST", body: JSON.stringify(newPost) });
```

### 5. **Configure staleTime Based on Data Type**

```jsx
// Frequently changing data
queryClient.fetchQuery({
  queryKey: ["live-score"],
  queryFn: fetchScore,
  staleTime: 1000 * 10, // 10 seconds
});

// Rarely changing data
queryClient.fetchQuery({
  queryKey: ["user-profile"],
  queryFn: fetchProfile,
  staleTime: 1000 * 60 * 30, // 30 minutes
});
```

---

## Summary: Why Use React Query?

| Feature                   | Without React Query         | With React Query               |
| ------------------------- | --------------------------- | ------------------------------ |
| **Caching**               | Manual implementation       | ✅ Automatic                   |
| **Refetching**            | Write custom logic          | ✅ Built-in strategies         |
| **Loading States**        | Manage in every component   | ✅ Handled by hook             |
| **Error Handling**        | Custom per component        | ✅ Centralized                 |
| **Data Sync**             | Complex state management    | ✅ Automatic across components |
| **Optimistic Updates**    | Difficult to implement      | ✅ Easy with onMutate          |
| **Background Updates**    | Not possible                | ✅ Stale-while-revalidate      |
| **Request Deduplication** | Multiple identical requests | ✅ Single request              |

**React Query transforms complex server state management into simple, declarative code.** 🚀

---

## Quick Reference

```jsx
// Setup
const queryClient = new QueryClient();

// Fetch data
const { data, isLoading } = useQuery({
  queryKey: ["posts"],
  queryFn: fetchPosts,
});

// Mutate data
const mutation = useMutation({
  mutationFn: createPost,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts"] }),
});

// Invalidate cache
queryClient.invalidateQueries({ queryKey: ["posts"] });

// Remove from cache
queryClient.removeQueries({ queryKey: ["post", id] });
```

---

**For more information:** [TanStack Query Documentation](https://tanstack.com/query/latest)
