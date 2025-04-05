import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";
import bodyParser from "body-parser";
import voiceController from "#controllers/voiceController.js";
import twilioService from "#services/twilioService.js";
import CallResponse from "#models/callResponse.js";

// Setup Express app with routes
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Route bindings
app.post("/voice", voiceController.handleVoiceRequest);
app.post("/incoming", voiceController.incomingCall);
app.post("/initiate", voiceController.initiateCall);
app.post("/call-status", voiceController.handleCallStatus);
app.post("/transcription", voiceController.saveTranscription);

describe("voiceController", () => {
  describe("POST /voice", () => {
    it("should respond with TwiML XML", async () => {
      const res = await request(app).post("/voice");
      expect(res.status).toBe(200);
      expect(res.type).toBe("text/xml");
      expect(res.text).toContain("<Say>");
      expect(res.text).toContain("<Record");
    });
  });

  describe("POST /incoming", () => {
    it("should return hangup TwiML response", async () => {
      const res = await request(app).post("/incoming");
      expect(res.status).toBe(200);
      expect(res.type).toBe("text/xml");
      expect(res.text).toContain("<Say>");
      expect(res.text).toContain("<Hangup");
    });
  });

  describe("POST /initiate", () => {
    it("should initiate a call when phone number is provided", async () => {
      const mockCall = { sid: "CA1234567890" };
      jest.spyOn(twilioService, "makeCall").mockResolvedValueOnce(mockCall);

      const res = await request(app).post("/initiate").send({ phoneNumber: "+1234567890" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("callSid", mockCall.sid);
    });

    it("should return 400 if phone number is missing", async () => {
      const res = await request(app).post("/initiate").send({});
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });

    it("should handle call initiation errors", async () => {
      jest.spyOn(twilioService, "makeCall").mockRejectedValueOnce(new Error("API error"));
      const res = await request(app).post("/initiate").send({ phoneNumber: "+1234567890" });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("POST /call-status", () => {
    it("should handle completed call status", async () => {
      const res = await request(app).post("/call-status").send({
        Called: "+1234567890",
        CallSid: "CA123",
        CallStatus: "completed",
      });

      expect(res.status).toBe(200);
    });

    it("should trigger SMS for failed calls", async () => {
      const spy = jest.spyOn(twilioService, "sendMissedCallSMS").mockResolvedValueOnce();

      const res = await request(app).post("/call-status").send({
        Called: "+1234567890",
        CallSid: "CA123",
        CallStatus: "failed",
      });

      expect(spy).toHaveBeenCalledWith("+1234567890");
      expect(res.status).toBe(200);
    });
  });

  describe("POST /transcription", () => {
    it("should save valid transcription", async () => {
      const mockSave = jest.spyOn(CallResponse.prototype, "save").mockResolvedValueOnce();

      const res = await request(app).post("/transcription").send({
        To: "+1234567890",
        CallSid: "CA123",
        TranscriptionText: "Yes, I took them",
        CallStatus: "completed",
        RecordingUrl: "http://recording.url",
      });

      expect(mockSave).toHaveBeenCalled();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message", "Transcription saved successfully");
    });

    it("should handle transcription save errors", async () => {
      jest.spyOn(CallResponse.prototype, "save").mockRejectedValueOnce(new Error("Save failed"));

      const res = await request(app).post("/transcription").send({
        To: "+1234567890",
        CallSid: "CA123",
        TranscriptionText: "Yes",
        CallStatus: "completed",
        RecordingUrl: "",
      });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("error");
    });
  });
});
