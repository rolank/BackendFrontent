import mongoose, { Mongoose, Schema } from "mongoose";
import { describe, expect, test, beforeEach, beforeAll } from "@jest/globals";
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
import { User } from "../db/models/user";
//We import createUser to potentially create a user if It does not exist
import { createUser } from "../services/users";
import { findUserId } from "../services/users";

let userId;

beforeAll(async () => {
  // Global Jest setup handles DB connection in setupFileAfterEnv.js
  // Retrieve the user created in the global setup (or create if missing)
  userId = await findUserId("testuser");
  if (!userId) {
    console.log("User 'testuser' not found, creating user...");
    let createdUser = await createUser({
      username: "testuser",
      email: "test@rolandklahitar.dev",
      password: "testpassword",
    });
    userId = createdUser._id;
  }
  console.log(`Using userId: ${userId}`);
}, 30000);

describe("Create Post", () => {
  test("with all parameters should succeed", async () => {
    const postDetails = {
      title: "Hello Mongoose",
      author: userId,
      contents: "This is my first post",
      tags: ["intro", "mongoose"],
    };
    const post = await createPost(postDetails);
    expect(post._id).toBeInstanceOf(mongoose.Types.ObjectId);

    const fetchedPost = await Post.findById(post._id).exec();
    expect(fetchedPost.title).toBe(postDetails.title);
    expect(fetchedPost.author.toString()).toBe(postDetails.author.toString());
    expect(fetchedPost.contents).toBe(postDetails.contents);
    expect(fetchedPost.tags).toEqual(expect.arrayContaining(postDetails.tags));
  });

  test("missing title should fail", async () => {
    const postDetails = {
      author: userId,
      contents: "This is my first post",
      tags: ["intro", "mongoose"],
    };
    try {
      await createPost(postDetails);
    } catch (error) {
      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(error.errors.title).toBeDefined();
      expect(error.errors.title.kind).toBe("required");
    }
  });

  test("missing author should fail", async () => {
    const postDetails = {
      title: "Hello Mongoose",
      contents: "This is my first post",
      tags: ["intro", "mongoose"],
    };
    try {
      await createPost(postDetails);
    } catch (error) {
      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(error.errors.author).toBeDefined();
      expect(error.errors.author.kind).toBe("required");
    }
  });


  test("only required parameters should succeed", async () => {
    const postDetails = {
      title: "Hello Mongoose",
      author: userId,
    };
    const post = await createPost(postDetails);
    expect(post._id).toBeInstanceOf(mongoose.Types.ObjectId);

    const fetchedPost = await Post.findById(post._id).exec();
    expect(fetchedPost.title).toBe(postDetails.title);
    expect(fetchedPost.author.toString()).toBe(postDetails.author.toString());
  });

});
afterAll(async () => {
  // Close mongoose connection after tests to avoid open handles
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});
describe("List Posts", () => {
  let post1, post2, post3;
  beforeEach(async () => {
    // Clear existing posts
    await Post.deleteMany({}).exec();

    // Create sample posts
    post1 = await createPost({
      title: "Post One",    
      author: userId,
      contents: "Content for post one",
      tags: ["tag1", "tag2"],
    });
    post2 = await createPost({
      title: "Post Two",
      author: userId,
      contents: "Content for post two",
      tags: ["tag2", "tag3"],
    });
    post3 = await createPost({
      title: "Post Three",
      author: userId,
      contents: "Content for post three",
      tags: ["tag1", "tag3"],
    }); 
  });

  test("list all posts", async () => {
    const posts = await listAllPosts({ sortBy: "createdAt", sortOrder: "ascending" });
    expect(posts.length).toBe(3);
    expect(posts[0].title).toBe("Post One");
    expect(posts[1].title).toBe("Post Two");
    expect(posts[2].title).toBe("Post Three");
    console.log("Posts:", posts);
  });

  test("list posts by author", async () => {
    const posts = await listPostsByAuthor(userId, { sortBy: "createdAt", sortOrder: "descending" });
    expect(posts.length).toBe(3);
    expect(posts[0].title).toBe("Post Three");
    expect(posts[1].title).toBe("Post Two");
    expect(posts[2].title).toBe("Post One");
  });

});