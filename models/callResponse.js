import mongoose from "mongoose";

// Define the schema for the call response data to be saved in MongoDB
const callResponseSchema = new mongoose.Schema({
  // Store the phone number of the person called
  phoneNumber: { type: String, required: true },

  // Unique identifier for the call, provided by Twilio
  callSid: { type: String, unique: true, required: true },

  // The transcription of the patient's response to the call (if any)
  transcription: { type: String, default: "" },

  // URL to the recording of the call (if available)
  recordingUrl: { type: String, default: "" },

  // The status of the call (e.g., completed, failed, etc.)
  callStatus: { type: String, required: true },

  // The timestamp when the call response was recorded
  timestamp: { type: Date, default: Date.now },
});

// Create and export the CallResponse model using the defined schema
const CallResponse = mongoose.model("CallResponse", callResponseSchema);

export default CallResponse;
