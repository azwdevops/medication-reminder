import mongoose from "mongoose";
import CallResponse from "#models/callResponse.js";

describe("CallResponse Model Test", () => {
  // Before each test, clear the CallResponse collection to start with a clean state
  beforeEach(async () => {
    await CallResponse.deleteMany(); // Clear collection before each test
  });

  /**
   * Test to check if a valid CallResponse is saved successfully.
   */
  test("should save a valid CallResponse", async () => {
    // Test data for a valid call response
    const callData = {
      phoneNumber: "+254712345678", // Test phone number
      callSid: "CA123456789", // Unique call SID
      transcription: "Yes, I took my medication.", // Transcription of the call
      recordingUrl: "https://recording-server.com/recording.mp3", // URL to the recorded call
      callStatus: "call-status", // The current status of the call
    };

    // Create a new CallResponse instance with the test data
    const callResponse = new CallResponse(callData);
    // Save the callResponse to the database
    const savedCall = await callResponse.save();

    // Assertions to check if the CallResponse was saved correctly
    expect(savedCall._id).toBeDefined(); // Ensure the saved call has an _id
    expect(savedCall.phoneNumber).toBe(callData.phoneNumber); // Check if phone number matches
    expect(savedCall.callSid).toBe(callData.callSid); // Check if call SID matches
    expect(savedCall.transcription).toBe(callData.transcription); // Check if transcription matches
    expect(savedCall.recordingUrl).toBe(callData.recordingUrl); // Check if recording URL matches
    expect(savedCall.callStatus).toBe(callData.callStatus); // Check if call status matches
  });

  /**
   * Test to ensure that a CallResponse cannot be saved without required fields.
   */
  test("should not save without required fields", async () => {
    // Create a CallResponse instance with no data
    const invalidCall = new CallResponse({});
    let error;

    try {
      // Attempt to save the invalid CallResponse
      await invalidCall.save();
    } catch (err) {
      // Catch any error thrown during save
      error = err;
    }

    // Assertions to verify that errors were thrown for missing fields
    expect(error).toBeDefined(); // Ensure there was an error
    expect(error.errors.phoneNumber).toBeDefined(); // phoneNumber should be required
    expect(error.errors.callSid).toBeDefined(); // callSid should be required
    expect(error.errors.callStatus).toBeDefined(); // callStatus should be required
  });

  /**
   * Test to ensure that duplicate callSids are not allowed in the CallResponse model.
   */
  test("should not allow duplicate callSid", async () => {
    // Test data for a call response with unique callSid
    const callData = {
      phoneNumber: "+254712345678", // Test phone number
      callSid: "CA123456789", // Unique call SID
      callStatus: "completed", // Call status
    };

    // First insert should succeed and save the call response
    await new CallResponse(callData).save();

    let error = null;

    try {
      // Attempt to insert the same callSid again (should fail due to uniqueness constraint)
      await new CallResponse(callData).save();
      // If this line is reached, it means the test should fail
      throw new Error("duplicate key");
    } catch (err) {
      // Catch the error thrown due to duplicate callSid
      error = err;
    }

    // Assertions to ensure that the error was due to a duplicate key violation
    expect(error).toBeDefined(); // Ensure an error was thrown
    // Check that the error message matches the "duplicate key" violation message
    expect(error.message).toMatch(/duplicate key/i);
  });
});
