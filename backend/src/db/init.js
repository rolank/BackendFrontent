import mongoose from "mongoose";

export function initDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }
  const DATABASE_URL = process.env.DATABASE_URL;

  mongoose.connection.on("open", () => {
    console.info("successfully connected to database:");
  });
  const connection = mongoose.connect(DATABASE_URL);
  return connection;
}
