import {
  listAllPosts,
  listPostsByAuthor,
  listPostsByTag,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} from "../services/posts.js";

export function postsRoutes(app) {
  app.get("/", (req, res) => {
    res.send("Hello, World!");
  });

  app.get("/api/v1/posts", async (req, res) => {
    try {
      const { sortBy, sortOrder, author, tag } = req.query;
      const options = { sortBy, sortOrder };
      if (author && tag) {
        return res
          .status(400)
          .json({ error: "Please specify either author or tag, not both." });
      } else if (author) {
        const posts = await listPostsByAuthor(author, options);
        return res.json(posts);
      } else if (tag) {
        const posts = await listPostsByTag(tag, options);
        return res.json(posts);
      } else {
        const posts = await listAllPosts(options);
        return res.json(posts);
      }
    } catch (err) {
      console.error("Error listing posts:", err);
      res.status(500).send("Internal Server Error");
    }
  });

  app.get("/api/v1/posts/:id", async (req, res) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).send("Post ID is required");
    }
    try {
      const post = await getPostById(id);
      if (!post) {
        return res.status(404).send("Post not found");
      }
      res.json(post);
    } catch (err) {
      console.error("Error fetching post by ID:", err);
      res.status(500).send("Internal Server Error");
    }
  });

  app.post("/api/v1/posts", async (req, res) => {
    const { title, author, contents, tags } = req.body;
    console.log(`req.body: ${JSON.stringify(req.body)}`);
    console.log(
      `title: ${title}, author: ${author}, contents: ${contents}, tags: ${tags}`,
    );
    if (!title || !author || !contents) {
      return res.status(400).send("Title, author, and contents are required");
    }
    try {
      const post = await createPost({ title, author, contents, tags });
      res.status(201).json(post);
    } catch (err) {
      console.error("Error creating post:", err);
      res.status(500).send("Internal Server Error");
    }
  });

  app.patch("/api/v1/posts/:id", async (req, res) => {
    const { id } = req.params;
    const { title, author, contents, tags } = req.body;
    if (!id || !title || !author || !contents) {
      return res
        .status(400)
        .send("Post ID, title, author, and contents are required");
    }
    try {
      const updatedPost = await updatePost(id, {
        title,
        author,
        contents,
        tags,
      });
      if (!updatedPost) {
        return res.status(404).send("Post not found");
      }
      res.json(updatedPost);
    } catch (err) {
      console.error("Error updating post:", err);
      res.status(500).send("Internal Server Error");
    }
  });

  app.delete("/api/v1/posts/:id", async (req, res) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).send("Post ID is required");
    }
    try {
      const result = await deletePost(id);
      if (result.deletedCount === 0) {
        return res.status(404).send("Post not found");
      }
      res.status(204).send();
    } catch (err) {
      console.error("Error deleting post:", err);
      res.status(500).send("Internal Server Error");
    }
  });
}
