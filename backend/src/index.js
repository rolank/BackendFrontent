import dotenv from "dotenv";
dotenv.config();

import { app } from "./app.js";
//import { initDatabase } from "./db/init.js";

const port = process.env.PORT || 8080;

app.listen(port, '0.0.0.0', () => { 
  console.log(`Server is running on port ${port}`);
});;


app.get("/", (req, res) => {
  res.send("Hello World!");
});

// await initDatabase();
// console.log("Database initialized");  