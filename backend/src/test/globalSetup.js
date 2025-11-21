import { MongoMemoryServer } from "mongodb-memory-server";

export default async function globalSetup() {
  /*
    MongoInstance
    create function will create an new Instance and start it (while being an Promise)
    https://typegoose.github.io/mongodb-memory-server/docs/api/classes/mongo-instance
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
  global.__MONGOINSTANCE = instance;
  process.env.DATABASE_URL = instance.getUri();
}
