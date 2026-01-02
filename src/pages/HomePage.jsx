import { useState } from "react";
import { useLoaderData, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PostFilter } from "../components/PostFilter.jsx";
import { PostSorting } from "../components/PostSorting.jsx";
import { PostList } from "../components/PostList.jsx";
import { API_BASE_URL } from "../config/api.js";
import "./HomePage.css";

export function HomePage() {
  const loaderData = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();

  const author = searchParams.get("author") || "";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "descending";

  // Use React Query with loader data as initialData
  const { data } = useQuery({
    queryKey: ["posts", { author, sortBy, sortOrder }],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE_URL}/posts?author=${author}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      if (!response.ok) throw new Error("Failed to fetch posts");
      return response.json();
    },
    initialData: loaderData.posts, // Use loader data as starting point
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const posts = data || [];

  const handleFilterChange = (value) => {
    if (value) {
      searchParams.set("author", value);
    } else {
      searchParams.delete("author");
    }
    setSearchParams(searchParams);
  };

  const handleSortByChange = (value) => {
    searchParams.set("sortBy", value);
    setSearchParams(searchParams);
  };

  const handleSortOrderChange = (value) => {
    searchParams.set("sortOrder", value);
    setSearchParams(searchParams);
  };

  return (
    <div className="home-container">
      <h1 className="home-title">Blog Posts</h1>
      <div className="home-filter-section">
        <h3 className="home-filter-title">Filter by:</h3>
        <PostFilter
          field="author"
          value={author}
          handleTextChange={handleFilterChange}
        />
      </div>
      <div className="home-sort-section">
        <PostSorting
          fields={["createdAt", "updatedAt"]}
          value={sortBy}
          handleSortBy={handleSortByChange}
          orderValue={sortOrder}
          handleSortOrder={handleSortOrderChange}
        />
      </div>
      <hr className="home-divider" />
      <PostList posts={posts} />
    </div>
  );
}
