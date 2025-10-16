import express from "express";
import { postsRoutes } from "./routes/posts.js ";
import { userRoutes } from "./routes/users.js";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
app.use(cors());
app.use(bodyParser.json());




postsRoutes(app);
userRoutes(app);

export { app };
