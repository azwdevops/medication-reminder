import mongoose from "mongoose";

const callResponseSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true },
  callSid: { type: String, unique: true, required: true },
  transcription: { type: String, default: "" },
  recordingUrl: { type: String, default: "" },
  callStatus: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const CallResponse = mongoose.model("CallResponse", callResponseSchema);

export default CallResponse;
