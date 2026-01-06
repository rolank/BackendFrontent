import { render, screen, cleanup } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, afterEach } from "vitest";
import { Post } from "./Post";

describe("Post Component", () => {
  const mockPost = {
    id: "123",
    title: "Test Post Title",
    contents: "This is the post content.",
    author: "Alice",
  };

  afterEach(() => {
    cleanup();
  });

  it("renders post title as a link", () => {
    render(
      <BrowserRouter>
        <Post {...mockPost} />
      </BrowserRouter>,
    );

    const titleLink = screen.getByRole("link", { name: mockPost.title });
    expect(titleLink).toBeInTheDocument();
    expect(titleLink).toHaveAttribute("href", `/posts/${mockPost.id}`);
  });

  it("renders post content", () => {
    render(
      <BrowserRouter>
        <Post {...mockPost} />
      </BrowserRouter>,
    );

    const content = screen.getAllByText(mockPost.contents);
    expect(content.length).toBeGreaterThan(0);
  });

  it("renders author information when provided", () => {
    render(
      <BrowserRouter>
        <Post {...mockPost} />
      </BrowserRouter>,
    );

    const writtenBy = screen.getAllByText(/written by:/i);
    expect(writtenBy.length).toBeGreaterThan(0);

    const authorName = screen.getAllByText(mockPost.author);
    expect(authorName.length).toBeGreaterThan(0);
  });

  it("does not render author section when author is not provided", () => {
    const postWithoutAuthor = {
      id: "456",
      title: "Post Without Author",
      contents: "Content here",
    };

    const { container } = render(
      <BrowserRouter>
        <Post {...postWithoutAuthor} />
      </BrowserRouter>,
    );

    expect(container.querySelector(".post-author")).not.toBeInTheDocument();
  });

  it("renders with numeric id", () => {
    const postWithNumericId = {
      ...mockPost,
      id: 789,
      title: "Different Title",
    };

    const { container } = render(
      <BrowserRouter>
        <Post {...postWithNumericId} />
      </BrowserRouter>,
    );

    const titleLink = container.querySelector("a.post-title-link");
    expect(titleLink).toHaveAttribute("href", "/posts/789");
  });

  it("renders article with correct class", () => {
    const { container } = render(
      <BrowserRouter>
        <Post {...mockPost} />
      </BrowserRouter>,
    );

    const article = container.querySelector("article.post");
    expect(article).toBeInTheDocument();
  });
});
