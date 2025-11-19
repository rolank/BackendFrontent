import dotenv from "dotenv";
dotenv.config();

import { app } from "./app.js";
import { initDatabase } from "./db/init.js";

try {
  await initDatabase();

  const port = process.env.PORT || 8080;
  app.listen(port, () => {
    console.log("Server listening on port", port);
  });
} catch (err) {
  console.error("error connecting to database:", err);
}
