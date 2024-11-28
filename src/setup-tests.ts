import { config } from "dotenv";

// Load the `.env.test` file
config({ path: ".env.test" });

// Log the loaded environment variable (optional, for debugging)
console.log("Loaded domain:", process.env.NEXT_PUBLIC_CUSTOMER_SCRAMBLE_DOMAIN);