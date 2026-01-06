import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { Layout } from "./Layout";

// Mock useRouteLoaderData to return auth data
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useRouteLoaderData: () => ({
      isAuthenticated: false,
      user: null,
    }),
  };
});

describe("Layout Component", () => {
  let queryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  it("renders the layout with header", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText("My Blog")).toBeInTheDocument();
  });

  it("renders home link in navigation", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      </QueryClientProvider>,
    );

    const homeLinks = screen.getAllByText("Home");
    expect(homeLinks.length).toBeGreaterThan(0);
  });

  it("renders footer with copyright", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      </QueryClientProvider>,
    );

    const footers = screen.getAllByText(/2026 My Blog/);
    expect(footers.length).toBeGreaterThan(0);
  });
});
