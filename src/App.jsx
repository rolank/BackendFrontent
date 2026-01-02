import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Layout
import { Layout } from "./components/Layout.jsx";

// Pages
import { HomePage } from "./pages/HomePage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { SignUpPage } from "./pages/SignUpPage.jsx";
import { CreatePostPage } from "./pages/CreatePostPage.jsx";
import { SinglePostPage } from "./pages/SinglePostPage.jsx";
import { EditPostPage } from "./pages/EditPostPage.jsx";

// Loaders
import { authLoader } from "./routes/auth.loader.js";
import { postsLoader, postLoader } from "./routes/posts.loader.js";

// Actions
import {
  loginAction,
  signupAction,
  logoutAction,
} from "./routes/auth.action.js";
import {
  createPostAction,
  updatePostAction,
  deletePostAction,
} from "./routes/posts.action.js";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - data stays fresh
      cacheTime: 1000 * 60 * 10, // 10 minutes - cache persists
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnReconnect: true, // Refetch when internet reconnects
      retry: 1, // Retry failed requests once
    },
  },
});

const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    loader: authLoader,
    id: "root",
    children: [
      {
        index: true,
        Component: HomePage,
        loader: postsLoader(queryClient),
      },
      {
        path: "login",
        Component: LoginPage,
        action: loginAction,
      },
      {
        path: "signup",
        Component: SignUpPage,
        action: signupAction,
      },
      {
        path: "logout",
        action: logoutAction,
      },
      {
        path: "create-post",
        Component: CreatePostPage,
        action: createPostAction(queryClient),
      },
      {
        path: "posts/:postId",
        Component: SinglePostPage,
        loader: postLoader(queryClient),
        action: deletePostAction(queryClient),
      },
      {
        path: "posts/:postId/edit",
        Component: EditPostPage,
        loader: postLoader(queryClient),
        action: updatePostAction(queryClient),
      },
    ],
  },
]);

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
