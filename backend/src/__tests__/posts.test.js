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


let userId;

beforeAll(async () => {
//retrieve the user created in setupFileAfterEnv.js
  const user = await User.findOne({ username: "testuser" });
  userId = user._id;
  console.log("Using user ID:", userId);
});


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
    
  })

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


