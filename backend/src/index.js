import dotenv from "dotenv";
dotenv.config();

import { app } from "./app.js";
import { initDatabase } from "./db/init.js";

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log("Server listening on port", port);
});

try {
  await initDatabase();
} catch (err) {
  console.error("error connecting to database:", err);
}
