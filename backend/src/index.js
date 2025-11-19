import dotenv from "dotenv";
dotenv.config();

import { app } from "./app.js";
import { initDatabase } from "./db/init.js";

try {
  await initDatabase();

  const PORT = process.env.PORT || 8080;
  app.listen(PORT, "0.0.0.0", () => {
    console.log("Server listening on port", PORT);
  });
} catch (err) {
  console.error("error connecting to database:", err);
}
