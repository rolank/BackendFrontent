import { Outlet, Link, Form, useRouteLoaderData } from "react-router-dom";
import "./Layout.css";

export function Layout() {
  const authData = useRouteLoaderData("root");
  const isAuthenticated = authData?.isAuthenticated;
  const user = authData?.user;

  return (
    <div>
      <header className="layout-header">
        <nav className="layout-nav">
          <div className="layout-nav-left">
            <Link to="/" className="layout-logo">
              My Blog
            </Link>
            <Link to="/" className="layout-nav-link">
              Home
            </Link>
            {isAuthenticated && (
              <Link to="/create-post" className="layout-nav-link">
                Create Post
              </Link>
            )}
          </div>
          <div className="layout-nav-right">
            {isAuthenticated ? (
              <>
                <span className="layout-greeting">
                  Hello, {user?.username}!
                </span>
                <Form
                  method="post"
                  action="/logout"
                  style={{ display: "inline" }}
                >
                  <button type="submit" className="layout-logout-button">
                    Logout
                  </button>
                </Form>
              </>
            ) : (
              <>
                <Link to="/login" className="layout-login-button">
                  Login
                </Link>
                <Link to="/signup" className="layout-signup-button">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>
      <main className="layout-main">
        <Outlet />
      </main>
      <footer className="layout-footer">
        <p>&copy; 2026 My Blog. All rights reserved.</p>
      </footer>
    </div>
  );
}
