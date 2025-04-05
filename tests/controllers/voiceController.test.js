import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";
import bodyParser from "body-parser";
import voiceController from "#controllers/voiceController.js";
import twilioService from "#services/twilioService.js";
import CallResponse from "#models/callResponse.js";

// Set up Express app with necessary middleware for handling body requests
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Route bindings for voice-related actions
app.post("/voice", voiceController.handleVoiceRequest); // Handles voice requests (e.g., to respond with TwiML)
app.post("/incoming", voiceController.incomingCall); // Handles incoming call requests
app.post("/initiate", voiceController.initiateCall); // Initiates outgoing call
app.post("/call-status", voiceController.handleCallStatus); // Handles updates on call status (e.g., completed, failed)
app.post("/transcription", voiceController.saveTranscription); // Saves transcription data from calls

/**
 * Test Suite for voiceController functionalities
 */
describe("voiceController", () => {
  /**
   * Test the /voice route that handles voice interactions with Twilio
   */
  describe("POST /voice", () => {
    it("should respond with TwiML XML", async () => {
      // Send request to /voice endpoint and check if we get back the correct TwiML response
      const res = await request(app).post("/voice");

      // Verify that the response is of type XML and contains the necessary elements
      expect(res.status).toBe(200); // Ensure status code is 200 OK
      expect(res.type).toBe("text/xml"); // Response type should be XML
      expect(res.text).toContain("<Say>"); // Should include <Say> tag to instruct Twilio to speak a message
      expect(res.text).toContain("<Record"); // Should include <Record> tag to record the user's response
    });
  });

  /**
   * Test the /incoming route to check how incoming calls are handled
   */
  describe("POST /incoming", () => {
    it("should return hangup TwiML response", async () => {
      // Send request to /incoming endpoint to simulate receiving a call
      const res = await request(app).post("/incoming");

      // Verify that the response tells Twilio to hang up the call
      expect(res.status).toBe(200); // Ensure status code is 200 OK
      expect(res.type).toBe("text/xml"); // Response type should be XML
      expect(res.text).toContain("<Say>"); // Includes a message to say
      expect(res.text).toContain("<Hangup"); // Ensures a hangup instruction is given
    });
  });

  /**
   * Test the /initiate route that initiates an outbound call
   */
  describe("POST /initiate", () => {
    it("should initiate a call when phone number is provided", async () => {
      const mockCall = { sid: "CA1234567890" }; // Mock call SID for the initiated call
      // Mock the Twilio service to resolve with a mock call SID
      jest.spyOn(twilioService, "makeCall").mockResolvedValueOnce(mockCall);

      // Send a request to initiate a call
      const res = await request(app).post("/initiate").send({ phoneNumber: "+1234567890" });

      // Verify the response contains the correct call SID
      expect(res.status).toBe(200); // Ensure status code is 200 OK
      expect(res.body).toHaveProperty("callSid", mockCall.sid); // The response should include the correct call SID
    });

    it("should return 400 if phone number is missing", async () => {
      // Send a request without providing a phone number
      const res = await request(app).post("/initiate").send({});

      // Verify that the response returns a 400 status indicating a bad request
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error"); // Response should include an error message
    });

    it("should handle call initiation errors", async () => {
      // Mock an error from Twilio's API when attempting to initiate a call
      jest.spyOn(twilioService, "makeCall").mockRejectedValueOnce(new Error("API error"));

      // Send a request to initiate a call
      const res = await request(app).post("/initiate").send({ phoneNumber: "+1234567890" });

      // Verify that the response handles the error properly and returns a 500 status
      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("error"); // The response should indicate an error occurred
    });
  });

  /**
   * Test the /call-status route that handles updates on call status
   */
  describe("POST /call-status", () => {
    it("should handle completed call status", async () => {
      // Simulate receiving a completed call status from Twilio
      const res = await request(app).post("/call-status").send({
        Called: "+1234567890",
        CallSid: "CA123",
        CallStatus: "completed",
      });

      // Verify that the call status is processed successfully
      expect(res.status).toBe(200); // Ensure status code is 200 OK
    });

    it("should trigger SMS for failed calls", async () => {
      // Spy on the sendMissedCallSMS method to ensure it gets called for failed calls
      const spy = jest.spyOn(twilioService, "sendMissedCallSMS").mockResolvedValueOnce();

      // Simulate a failed call status
      const res = await request(app).post("/call-status").send({
        Called: "+1234567890",
        CallSid: "CA123",
        CallStatus: "failed",
      });

      // Verify that the SMS sending function was called with the correct phone number
      expect(spy).toHaveBeenCalledWith("+1234567890");
      expect(res.status).toBe(200); // Ensure status code is 200 OK
    });
  });

  /**
   * Test the /transcription route to handle transcription data saving
   */
  describe("POST /transcription", () => {
    it("should save valid transcription", async () => {
      // Spy on the CallResponse save method to mock successful saving
      const mockSave = jest.spyOn(CallResponse.prototype, "save").mockResolvedValueOnce();

      // Simulate posting transcription data
      const res = await request(app).post("/transcription").send({
        To: "+1234567890",
        CallSid: "CA123",
        TranscriptionText: "Yes, I took them",
        CallStatus: "completed",
        RecordingUrl: "http://recording.url",
      });

      // Verify that the save method was called and the response is correct
      expect(mockSave).toHaveBeenCalled(); // Check that save method was called
      expect(res.status).toBe(200); // Ensure status code is 200 OK
      expect(res.body).toHaveProperty("message", "Transcription saved successfully"); // Success message should be returned
    });

    it("should handle transcription save errors", async () => {
      // Simulate an error when trying to save transcription data
      jest.spyOn(CallResponse.prototype, "save").mockRejectedValueOnce(new Error("Save failed"));

      // Send a request with transcription data
      const res = await request(app).post("/transcription").send({
        To: "+1234567890",
        CallSid: "CA123",
        TranscriptionText: "Yes",
        CallStatus: "completed",
        RecordingUrl: "",
      });

      // Verify that the error is handled properly
      expect(res.status).toBe(500); // Return a 500 status code for errors
      expect(res.body).toHaveProperty("error"); // The response should contain an error message
    });
  });
});
