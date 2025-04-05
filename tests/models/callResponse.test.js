import mongoose from "mongoose";
import CallResponse from "#models/callResponse.js";

describe("CallResponse Model Test", () => {
  beforeEach(async () => {
    await CallResponse.deleteMany(); // Clear collection before each test
  });

  test("should save a valid CallResponse", async () => {
    const callData = {
      phoneNumber: "+254712345678",
      callSid: "CA123456789",
      transcription: "Yes, I took my medication.",
      recordingUrl: "https://recording-server.com/recording.mp3",
      callStatus: "call-status",
    };

    const callResponse = new CallResponse(callData);
    const savedCall = await callResponse.save();

    expect(savedCall._id).toBeDefined();
    expect(savedCall.phoneNumber).toBe(callData.phoneNumber);
    expect(savedCall.callSid).toBe(callData.callSid);
    expect(savedCall.transcription).toBe(callData.transcription);
    expect(savedCall.recordingUrl).toBe(callData.recordingUrl);
    expect(savedCall.callStatus).toBe(callData.callStatus);
  });

  test("should not save without required fields", async () => {
    const invalidCall = new CallResponse({});
    let error;

    try {
      await invalidCall.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.phoneNumber).toBeDefined();
    expect(error.errors.callSid).toBeDefined();
    expect(error.errors.callStatus).toBeDefined();
  });

  test("should not allow duplicate callSid", async () => {
    const callData = {
      phoneNumber: "+254712345678",
      callSid: "CA123456789",
      callStatus: "completed",
    };

    // First insert should succeed
    await new CallResponse(callData).save();

    let error = null;

    try {
      // Second insert should fail
      await new CallResponse(callData).save();
      // If we get here, test should fail
      throw new Error("duplicate key");
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    // You can also match error message or code if needed:
    expect(error.message).toMatch(/duplicate key/i);
  });
});
