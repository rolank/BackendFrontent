import mongoose from "mongoose";

export function initDatabase() {
  mongoose.connection.on("open", () => {
    console.info("successfully connected to database:", DATABASE_URL);
  });
  //const DATABASE_URL = "mongodb://localhost:27017/blog";
  const DATABASE_URL = process.env.DATABASE_URL;
  const connection = mongoose.connect(DATABASE_URL);
  return connection;
}
