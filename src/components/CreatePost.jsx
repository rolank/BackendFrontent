import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { createPost } from "../api/posts.js";

export function CreatePost() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [contents, setcontents] = useState("");

  const queryClient = useQueryClient();
  const createPostMutation = useMutation({
    mutationFn: () => createPost({ title, author, contents }),
    onSuccess: () => queryClient.invalidateQueries(["posts"]),
    onError: (error) => {
      console.error("Error creating post:", error);
    },
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    createPostMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="create-title">Title:</label>
        <input
          type="text"
          id="create-title"
          name="create-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <br />
      <div>
        <label htmlFor="create-author">Author: </label>
        <input
          type="text"
          id="create-author"
          name="create-author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
      </div>
      <br />
      <textarea
        id="create-contents"
        name="create-contents"
        rows="5"
        cols="30"
        placeholder="Write your post contents here..."
        value={contents}
        onChange={(e) => setcontents(e.target.value)}
        required
      ></textarea>
      <br />
      <br />
      <input
        type="submit"
        value={createPostMutation.isPending ? "Creating..." : "Create"}
        disabled={!title || createPostMutation.isPending}
      />
      {createPostMutation.isError && (
        <div style={{ color: "red" }}>
          Error creating post: {createPostMutation.error.message}
        </div>
      )}
      {createPostMutation.isSuccess && (
        <div style={{ color: "green" }}>Post created successfully!</div>
      )}
      <br />
    </form>
  );
}
