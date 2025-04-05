import { jest } from "@jest/globals";
import request from "supertest"; // Supertest for making HTTP requests in the tests
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import CallResponse from "#models/callResponse.js";
import responseController from "#controllers/responseController.js";

// Load environment variables from the .env file
dotenv.config();

// Set up an Express app for testing
const app = express();
app.use(express.json());

// Define the routes for testing the responseController
app.get("/responses", responseController.getAllResponses);
app.get("/responses/analyze", responseController.analyzeResponses);

// Set up the database connection before tests start
beforeAll(async () => {
  await mongoose.connect(process.env.TESTS_MONGODB_URI); // Connect to the test database
  await CallResponse.syncIndexes(); // Sync any indexes before tests
});

// Clean up the database after each test
afterEach(async () => {
  await CallResponse.deleteMany(); // Delete all documents in the CallResponse collection
});

// Close the database connection after all tests
afterAll(async () => {
  await mongoose.connection.close(); // Close the database connection
});

describe("responseController", () => {
  // Test the GET /responses route
  describe("GET /responses", () => {
    it("should return all responses", async () => {
      // Create some sample responses in the database
      await CallResponse.create([
        { phoneNumber: "+254712345678", callSid: "CA123", callStatus: "completed" },
        { phoneNumber: "+254712345679", callSid: "CA124", callStatus: "completed" },
      ]);

      // Send a GET request to the /responses route
      const res = await request(app).get("/responses");

      // Check if the response is successful and contains the expected data
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(2); // Should return 2 responses
      expect(res.body[0]).toHaveProperty("phoneNumber"); // First response should have a phoneNumber
    });

    it("should handle errors gracefully", async () => {
      // Mock an error when querying the database
      jest.spyOn(CallResponse, "find").mockRejectedValueOnce(new Error("DB error"));

      // Send a GET request to the /responses route
      const res = await request(app).get("/responses");

      // Check that the error is handled correctly
      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: "Failed to fetch responses" });

      // Restore the original implementation of find
      CallResponse.find.mockRestore();
    });
  });

  // Test the GET /responses/analyze route
  describe("GET /responses/analyze", () => {
    it("should return counts of confirmed and unclear responses", async () => {
      // Create some sample responses with different transcriptions
      await CallResponse.create([
        { callSid: "1", phoneNumber: "x", callStatus: "completed", transcription: "Yes, I have taken it" },
        { callSid: "2", phoneNumber: "x", callStatus: "completed", transcription: "No, I forgot" },
        { callSid: "3", phoneNumber: "x", callStatus: "completed", transcription: "Unclear response" },
        { callSid: "4", phoneNumber: "x", callStatus: "completed", transcription: "Okay" },
      ]);

      // Send a GET request to analyze the responses
      const res = await request(app).get("/responses/analyze");

      // Check if the response contains the correct counts
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        totalResponses: 4,
        confirmedCount: 1,
        unclearCount: 2,
      });
    });

    it("should handle analysis errors gracefully", async () => {
      // Mock an error when analyzing the responses
      jest.spyOn(CallResponse, "find").mockRejectedValueOnce(new Error("DB error"));

      // Send a GET request to analyze the responses
      const res = await request(app).get("/responses/analyze");

      // Check that the error is handled correctly
      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: "Failed to analyze responses" });

      // Restore the original implementation of find
      CallResponse.find.mockRestore();
    });
  });
});
