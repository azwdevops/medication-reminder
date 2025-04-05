import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

beforeAll(async () => {
  const mongoUri = process.env.TESTS_MONGODB_URI;
  await mongoose.connect(mongoUri);
});

afterEach(async () => {
  await mongoose.connection.db.dropDatabase(); // Clear test database after each test
});

afterAll(async () => {
  await mongoose.connection.close();
});
