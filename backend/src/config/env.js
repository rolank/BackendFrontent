import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Load environment-specific configuration
 * Loads .env file based on NODE_ENV
 * Priority: .env.[environment] > .env
 */
export function loadConfig() {
  const env = process.env.NODE_ENV || "development";

  // Load base .env file first
  dotenv.config({ path: resolve(__dirname, "../../.env") });

  // Load environment-specific .env file (overrides base)
  const envPath = resolve(__dirname, `../../.env.${env}`);
  dotenv.config({ path: envPath });

  console.log(`Loaded configuration for environment: ${env}`);

  return {
    env,
    databaseUrl: process.env.DATABASE_URL,
    port: process.env.PORT || 8080,
  };
}
