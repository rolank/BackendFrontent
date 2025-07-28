import { initDatabase } from "./db/init.js";
import { Post } from "./db/models/post.js";
initDatabase();

const posts = [
  {
    title: "Hello Mongoose!",
    author: "Daniel Bugl",
    contents: "This post is stored in a MongoDB database using Mongoose.",
    tags: ["mongoose", "mongodb"],
  },
  { title: "Learning Redux", author: "Daniel Bugl", tags: ["redux"] },
  { title: "Learn React Hooks", author: "Daniel Bugl", tags: ["react"] },
  {
    title: "Full-Stack React Projects",
    author: "Daniel Bugl",
    contents: "This Full-Stack React Projects book is awesome!",
    tags: ["react", "nodejs"],
  },
  {
    title: "Hello React!",
    contents: "This is my first post in this book.",
    author: "Roland Klahitar",
    tags: ["JavaScript", "React"],
  },
  {
    title: "Hello again, Mongoose!",
    author: "Andrew Pete",
    ontents: "This Full-Stack React Projects book is was witten in 2025!",
    tags: ["TypeScript", "Mongoose", "MongoDB"],
  },
  {
    title: "Hello again, MongoDB!",
    author: "Roland Klahitar",
    tags: ["MongoDB"],
  },
  { title: "Web Framework!", author: "Roland Klahitar", tags: ["Express"] },
];

await Post.insertMany(posts);



const findPosts = await Post.find();
console.log(findPosts);
