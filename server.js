import "dotenv/config"; // Load environment variables from .env file
import express from "express"; // Import Express framework for building the API
import cors from "cors"; // Import CORS middleware to handle cross-origin requests
import { dbConnect } from "#utils/dbConnect.js"; // Import the database connection utility
import routes from "#routes/index.js"; // Import the route definitions

const app = express(); // Initialize the Express app

// Middleware setup
app.use(cors()); // Enable CORS to allow requests from different origins
app.use(express.json()); // Parse incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data (for form submissions)

// Define the routes for the app
app.use("/", routes); // Use the imported routes for handling requests

// Connect to the database
dbConnect(); // Establish a connection to the MongoDB database

// Define the port for the server to listen on
const PORT = process.env.PORT || 5000; // Use the PORT from environment variable or default to 5000

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`); // Log a message once the server is running
});

export default app; // Export the app for testing or further use
