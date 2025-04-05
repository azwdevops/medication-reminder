import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import CallResponse from "#models/callResponse.js";
import responseController from "#controllers/responseController.js";

dotenv.config();

// Set up Express app with routes
const app = express();
app.use(express.json());

app.get("/responses", responseController.getAllResponses);
app.get("/responses/analyze", responseController.analyzeResponses);

beforeAll(async () => {
  await mongoose.connect(process.env.TESTS_MONGODB_URI);
  await CallResponse.syncIndexes();
});

afterEach(async () => {
  await CallResponse.deleteMany();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("responseController", () => {
  describe("GET /responses", () => {
    it("should return all responses", async () => {
      await CallResponse.create([
        { phoneNumber: "+254712345678", callSid: "CA123", callStatus: "completed" },
        { phoneNumber: "+254712345679", callSid: "CA124", callStatus: "completed" },
      ]);

      const res = await request(app).get("/responses");

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toHaveProperty("phoneNumber");
    });

    it("should handle errors gracefully", async () => {
      // Mock an error
      jest.spyOn(CallResponse, "find").mockRejectedValueOnce(new Error("DB error"));

      const res = await request(app).get("/responses");

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: "Failed to fetch responses" });

      CallResponse.find.mockRestore();
    });
  });

  describe("GET /responses/analyze", () => {
    it("should return counts of confirmed and unclear responses", async () => {
      await CallResponse.create([
        { callSid: "1", phoneNumber: "x", callStatus: "completed", transcription: "Yes, I have taken it" },
        { callSid: "2", phoneNumber: "x", callStatus: "completed", transcription: "No, I forgot" },
        { callSid: "3", phoneNumber: "x", callStatus: "completed", transcription: "Unclear response" },
        { callSid: "4", phoneNumber: "x", callStatus: "completed", transcription: "Okay" },
      ]);

      const res = await request(app).get("/responses/analyze");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        totalResponses: 4,
        confirmedCount: 1,
        unclearCount: 2,
      });
    });

    it("should handle analysis errors gracefully", async () => {
      jest.spyOn(CallResponse, "find").mockRejectedValueOnce(new Error("DB error"));

      const res = await request(app).get("/responses/analyze");

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: "Failed to analyze responses" });

      CallResponse.find.mockRestore();
    });
  });
});
