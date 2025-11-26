import mongoose from "mongoose";
import { beforeAll, afterAll } from "@jest/globals";
import { loadConfig } from "../config/env.js";
import { initDatabase } from "../db/init";
import { createUser, deleteUser } from "../services/users.js";

beforeAll(async () => {
  // Load test environment configuration
  // DATABASE_URL is set by globalSetup.js for in-memory MongoDB
  loadConfig();

  // Connect to the in-memory MongoDB set by globalSetup
  await initDatabase();

  // Create a sample user for tests
  const sampleUser = {
    username: "testuser",
    email: "test@rolandklahitar.dev",
    password: "testpassword",
  };
  // Idempotent user creation to avoid duplicates in re-runs
  try {
    await createUser(sampleUser);
  } catch (err) {
    // Ignore duplicate errors if user already exists
  }
});

afterAll(async () => {
  await deleteUser("testuser");
  await mongoose.connection.close();
});
