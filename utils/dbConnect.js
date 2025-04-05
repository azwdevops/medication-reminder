import mongoose from "mongoose";

// Function to connect to the MongoDB database
export const dbConnect = async () => {
  try {
    // Check if MongoDB URI is provided in the environment variables
    if (!process.env.MONGODB_URI) {
      console.error("MONGODB_URI is missing in .env file"); // Log an error if MONGODB_URI is not found
      process.exit(1); // Exit the process as the DB connection cannot be established without the URI
    }

    // Attempt to connect to MongoDB using the URI from environment variables
    await mongoose.connect(`${process.env.MONGODB_URI}`);
    console.log("Mongo DB connected"); // Log success message upon successful connection
  } catch (err) {
    // Log error if the connection fails
    console.log("MongoDB connection ERROR", err);
    process.exit(1); // Exit the process if the connection fails to prevent further execution
  }
};
