import mongoose from "mongoose";

export const dbConnect = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error("MONGODB_URI is missing in .env file");
      process.exit(1);
    }
    await mongoose.connect(`${process.env.MONGODB_URI}`);
    console.log("Mongo DB connected");
  } catch (err) {
    console.log("MongoDB connection ERROR", err);
    process.exit(1); // Exit the process if the connection fails
  }
};
