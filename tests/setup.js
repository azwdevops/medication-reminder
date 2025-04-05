import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Setup before all tests: Connect to the MongoDB test database
beforeAll(async () => {
  const mongoUri = process.env.TESTS_MONGODB_URI; // Get MongoDB URI from environment variables
  await mongoose.connect(mongoUri); // Establish connection to the MongoDB database
});

// After each test: Drop the test database to ensure a clean state
afterEach(async () => {
  await mongoose.connection.db.dropDatabase(); // Clear the test database after each test
});

// After all tests: Close the MongoDB connection
afterAll(async () => {
  await mongoose.connection.close(); // Close the MongoDB connection when tests are done
});
