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

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    loader: authLoader,
    id: "root",
    children: [
      {
        index: true,
        element: <HomePage />,
        loader: postsLoader,
      },
      {
        path: "login",
        element: <LoginPage />,
        action: loginAction,
      },
      {
        path: "signup",
        element: <SignUpPage />,
        action: signupAction,
      },
      {
        path: "logout",
        action: logoutAction,
      },
      {
        path: "create-post",
        element: <CreatePostPage />,
        action: createPostAction,
      },
      {
        path: "posts/:postId",
        element: <SinglePostPage />,
        loader: postLoader,
        action: deletePostAction,
      },
      {
        path: "posts/:postId/edit",
        element: <EditPostPage />,
        loader: postLoader,
        action: updatePostAction,
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
