/*backend/src/index.js is to connect to the database and start the Express server. 
 The database here is not the in-memory database used for testing, 
 but the actual database specified in the environment variables.
 */

import { loadConfig } from "./config/env.js";

// Load environment-specific configuration
loadConfig();

import { app } from "./app.js";
import { initDatabase } from "./db/init.js";

// Use the PORT from environment variables or default to 8080.
// That is done in order to align default port used in google cloud deployment.

const port = process.env.PORT || 8080;

// Initialize the database connection before starting the server.
await initDatabase();
console.log("Database initialized");

/* Start the Express server and listen on the specified port.
  '0.0.0.0' allows connections from any network interface because
in cloud environments, the server might not be running on localhost.
*/
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});


