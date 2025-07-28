import dotenv from "dotenv";
dotenv.config();

import { app } from "./app.js";
import { initDatabase } from "./db/init.js";

try {
  await initDatabase();
  const PORT = process.env.PORT || 3000;
  console.info(`Server is running on http://localhost:${PORT}`);
  app.listen(PORT);
} catch (err) {
  console.error("error connecting to database:", err);
}
