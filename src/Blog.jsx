import React, { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";

//import { Post } from "./components/Post.jsx";
import { CreatePost } from "./components/CreatePost.jsx";
import { PostFilter } from "./components/PostFilter.jsx";
import { PostSorting } from "./components/PostSorting.jsx";
import { PostList } from "./components/PostList.jsx";
import { useQuery } from "@tanstack/react-query";
import { getPosts } from "./api/posts.js";

export function Blog() {
  const [author, setAuthor] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("descending");

  const postsQuery = useQuery({
    queryKey: ["posts", { author, sortBy, sortOrder }],
    queryFn: () => getPosts({ author, sortBy, sortOrder }),
  });

  const posts = postsQuery.data ?? [];

  return (
    <div style={{ padding: 8 }}>
      <CreatePost />
      <br />
      <hr />
      Fiter by:
      <PostFilter
        field="author"
        value={author}
        handleTextChange={(value) => setAuthor(value)}
      />
      <br />
      <PostSorting
        fields={["createdAt", "updatedAt"]}
        value={sortBy}
        handleSortBy={(value) => setSortBy(value)}
        orderValue={sortOrder}
        handleSortOrder={(orderValue) => setSortOrder(orderValue)}
      />
      <hr />
      <PostList posts={posts} />
    </div>
  );
}
