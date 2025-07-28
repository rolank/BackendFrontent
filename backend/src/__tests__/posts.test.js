import mongoose, { Mongoose } from "mongoose";
import { describe, expect, test, beforeEach } from "@jest/globals";
import {
  createPost,
  listAllPosts,
  listPostsByAuthor,
  listPostsByTag,
  getPostById,
  updatePost,
  deletePost,
} from "../services/posts";
import { Post } from "../db/models/post";

describe("creating posts", () => {
  test("with all parameters should succeed", async () => {
    const post = {
      title: "Hello Mongoose!",
      author: "Daniel Bugl",
      contents: "This post is stored in a MongoDB database using Mongoose.",
      tags: ["mongoose", "mongodb"],
    };
    const createdPost = await createPost(post);
    expect(createdPost._id).toBeInstanceOf(mongoose.Types.ObjectId);
    const foundPost = await Post.findById(createdPost._id);

    expect(foundPost).toEqual(expect.objectContaining(post));
    expect(foundPost.createdAt).toBeInstanceOf(Date);
    expect(foundPost.updatedAt).toBeInstanceOf(Date);
  });

  test("without title should fail", async () => {
    const post = {
      author: "Daniel Bugl",
      contents: "Post with no title",
      tags: ["empty"],
    };

    try {
      await createPost(post);
    } catch (err) {
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.message).toContain("`title` is required");
    }
  });

  test("with minimal parameters should succeed", async () => {
    const post = {
      title: "Only a title",
    };
    const createdPost = await createPost(post);
    expect(createdPost._id).toBeInstanceOf(mongoose.Types.ObjectId);
  });
});

const samplePosts = [
  { title: "Learning Redux", author: "Daniel Bugl", tags: ["redux"] },
  { title: "Learn React Hooks", author: "Daniel Bugl", tags: ["react"] },
  {
    title: "Full-Stack React Projects",
    author: "Daniel Bugl",
    tags: ["react", "nodejs"],
  },
  { title: "Guide to TypeScript" },
];

let createdSamplePosts = [];
beforeEach(async () => {
  await Post.deleteMany({});
  createdSamplePosts = [];
  for (const post of samplePosts) {
    const createdPost = new Post(post);
    createdSamplePosts.push(await createdPost.save());
  }
});

describe("listing posts", () => {
  test("all posts should be listed", async () => {
    const posts = await listAllPosts();
    expect(posts).toHaveLength(createdSamplePosts.length);
    expect(posts.map((p) => p.title)).toEqual(
      expect.arrayContaining(createdSamplePosts.map((p) => p.title))
    );
  });

  test("posts should be sorted by createdAt in descending order by default", async () => {
    //listAllPosts lists all posts and shows the newest posts first (sorted by createdAt, in descending order)
    const posts = await listAllPosts();
    /*spread operator is used to create a shallow copy of the createdSamplePosts. 
    It is safe way to avoid changing createdSamplePosts array*/
    const sortedSamplePosts = [...createdSamplePosts].sort(
      (a, b) => b.createdAt - a.createdAt
    );
    expect(posts).toHaveLength(samplePosts.length);
    expect(posts.map((post) => post.createdAt)).toEqual(
      sortedSamplePosts.map((post) => post.createdAt)
    );
  });

  test("posts should be sorted by updateAt in ascending order", async () => {
    const posts = await listAllPosts({
      sortBy: "updatedAt",
      sortOrder: "ascending",
    });
    const sortedSamplePosts = [...createdSamplePosts].sort(
      (a, b) => a.updatedAt - b.updatedAt
    );
    expect(posts).toHaveLength(samplePosts.length);
    expect(posts.map((post) => post.updatedAt)).toEqual(
      sortedSamplePosts.map((post) => post.updatedAt)
    );
  });

  test("posts by author should be listed", async () => {
    const posts = await listPostsByAuthor("Daniel Bugl");
    expect(posts).toHaveLength(3);
    expect(posts.map((post) => post.title)).toEqual(
      expect.arrayContaining([
        "Learning Redux",
        "Learn React Hooks",
        "Full-Stack React Projects",
      ])
    );
  });

  test("posts by tag should be listed", async () => {
    const posts = await listPostsByTag("react");
    expect(posts).toHaveLength(2);
    expect(posts.map((post) => post.title)).toEqual(
      expect.arrayContaining(["Learn React Hooks", "Full-Stack React Projects"])
    );
  });
});

describe("getting a post", () => {
  test("by id should succeed", async () => {
    const post = createdSamplePosts[0];
    const foundPost = await getPostById(post._id);
    expect(foundPost).toEqual(expect.objectContaining(post.toObject()));
  });

  test("by non-existing id should return null", async () => {
    const foundPost = await getPostById(new mongoose.Types.ObjectId());
    expect(foundPost).toBeNull();
  });
});

describe("updating a post", () => {
  test("should succeed with all parameters", async () => {
    const post = createdSamplePosts[0];
    const updatedPost = await updatePost(post._id, {
      title: "Updated Post",
      author: "Updated Author",
      contents: "Updated contents",
      tags: ["updated", "post"],
    });
    expect(updatedPost).toEqual(
      expect.objectContaining({
        _id: post._id,
        title: "Updated Post",
        author: "Updated Author",
        contents: "Updated contents",
        tags: ["updated", "post"],
      })
    );
    const foundPost = await Post.findById(post._id);
    expect(foundPost).toEqual(
      expect.objectContaining({
        _id: post._id,
        title: "Updated Post",
        author: "Updated Author",
        contents: "Updated contents",
        tags: ["updated", "post"],
      })
    );
  });
  test("should succeed with minimal parameters", async () => {
    const post = createdSamplePosts[0];
    const updatedPost = await updatePost(post._id, { title: "Minimal Update" });
    expect(updatedPost).toEqual(
      expect.objectContaining({
        _id: post._id,
        title: "Minimal Update",
      })
    );
    const foundPost = await Post.findById(post._id);
    expect(foundPost).toEqual(
      expect.objectContaining({
        _id: post._id,
        title: "Minimal Update",
      })
    );
  });
  test("should fail with non-existing id", async () => {
    const nonExistingId = new mongoose.Types.ObjectId();
    try {
      await updatePost(nonExistingId, { title: "Non-existing Post" });
    } catch (err) {
      expect(err).toBeInstanceOf(mongoose.Error.CastError);
      expect(err.message).toContain("Cast to ObjectId failed");
    }
  });
  test("should fail with invalid parameters", async () => {
    const post = createdSamplePosts[0];
    try {
      await updatePost(post._id, { title: "" }); // Empty title should fail
    } catch (err) {
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.message).toContain("`title` is required");
    }
  });
  test("Should update the updatedAt timestamp", async () => {
    const post = createdSamplePosts[0];
    const initialUpdatedAt = post.updatedAt;
    await updatePost(post._id, { title: "Updated Title" });
    const updatedPost = await Post.findById(post._id);
    expect(updatedPost.updatedAt.getTime()).toBeGreaterThan(
      initialUpdatedAt.getTime()
    );
  });
});

describe("deleting a post", () => {
  test("should succeed with existing id", async () => {
    const post = createdSamplePosts[0];
    const result = await deletePost(post._id);
    expect(result.deletedCount).toBe(1);
    const foundPost = await Post.findById(post._id);
    expect(foundPost).toBeNull();
  });

  test("should fail with non-existing id", async () => {
    const nonExistingId = new mongoose.Types.ObjectId();
    const result = await deletePost(nonExistingId);
    expect(result.deletedCount).toBe(0);
  });
});