import { MongoMemoryServer } from "mongodb-memory-server";

export default async function globalSetup() {
  console.log("Running global setup...");
  /*
    MongoInstance
    create function will create an new Instance and start it (while being an Promise)
    https://typegoose.github.io/mongodb-memory-server/docs/api/classes/mongo-instance
    */

   /* her we create an in-memory MongoDB instance for testing purposes.
      This instance runs in memory and does not persist data to disk,
      making it ideal for isolated and repeatable tests.
   */

  const instance = await MongoMemoryServer.create({
    binary: {
      version: "8.0.11",
    },
  });

  /*
    In Node.js and Jest, global is a built-in object that allows you to define 
    variables/functions accessible in all files without importing.
    */

   /* Here, we store the MongoDB instance in the global object, allowing other test files to access it if needed.
      We also set the DATABASE_URL environment variable to point to this in-memory database,
      ensuring that our application connects to it during tests.
   */

  global.__MONGOINSTANCE = instance;
  process.env.DATABASE_URL = instance.getUri();
  console.log("In global setup, set DATABASE_URL to:", process.env.DATABASE_URL);
}
