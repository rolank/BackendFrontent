import { mongoose } from "mongoose";
import { beforeAll, afterAll } from "@jest/globals";
import { initDatabase } from "../db/init";
import { createUser , deleteUser } from "../services/users.js";


beforeAll(async () => {
  await initDatabase();

  // Create a sample user for tests
  const sampleUser = {
    username: "testuser",
    email: "test@rolandklahitar.dev",
    password: "testpassword",
  };
  await createUser(sampleUser);


});

afterAll(async () => {
  await deleteUser("testuser");
  await mongoose.connection.close();
});