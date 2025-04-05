import twilio from "twilio";
import CallResponse from "#models/callResponse.js";
import twilioService from "#services/twilioService.js";

const voiceController = {
  handleVoiceRequest: (req, res) => {
    const { VoiceResponse } = twilio.twiml;
    const response = new VoiceResponse();

    response.say(
      "Hello, this is a reminder from your healthcare provider to confirm your medications for the day. " +
        "Please confirm if you have taken your Aspirin, Cardivol, and Metformin today.",
      { voice: "alice", language: "en-US" }
    );

    // Record the patient's response
    response.record({
      maxLength: 30,
      transcribe: true,
      transcribeCallback: "/api/transcription",
      action: "/api/call-status", // Redirect if call is not answered
      timeout: 10, // Wait 10 seconds before assuming no answer
    });

    res.type("text/xml").send(response.toString());
  },

  initiateCall: async (req, res) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    try {
      const call = await twilioService.makeCall(phoneNumber);
      console.log(`📞 Call initiated - SID: ${call.sid} to ${phoneNumber}`);
      res.json({ message: "Call initiated", callSid: call.sid });
    } catch (error) {
      console.error("Error making call:", error.message);
      res.status(500).json({ error: "Failed to initiate call" });
    }
  },

  handleCallStatus: async (req, res) => {
    const { Called, CallSid, CallStatus } = req.body;

    console.log(`Call Status Update: ${CallStatus} | Number: ${Called} | Call SID: ${CallSid}`);

    switch (CallStatus) {
      case "completed":
        console.log(`Call was successfully completed with Call SID: ${CallSid}`);
        break;

      case "no-answer":
      case "busy":
      case "failed":
        console.log(`Call to ${Called} was not successful. Sending SMS Reminder...`);
        await twilioService.sendMissedCallSMS(Called);
        break;

      case "canceled":
        console.log(`Call to ${Called} was canceled.`);
        break;

      default:
        console.log(`Unknown call status received: ${CallStatus}`);
    }

    res.status(200).send("OK");
  },

  saveTranscription: async (req, res) => {
    const { To, CallSid, TranscriptionText, CallStatus, RecordingUrl } = req.body;

    try {
      const response = new CallResponse({
        phoneNumber: To,
        callSid: CallSid,
        transcription: TranscriptionText || "No transcription available",
        callStatus: CallStatus,
        recordingUrl: RecordingUrl,
      });

      await response.save();
      console.log("Transcription saved:", response);

      res.status(200).json({ message: "Transcription saved successfully" });
    } catch (error) {
      console.error("Error saving transcription:", error);
      res.status(500).json({ error: "Failed to save transcription" });
    }
  },

  incomingCall: async (req, res) => {
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();

    // Predefined message to play when the patient calls back
    response.say(
      "Hello, this is a reminder from your healthcare provider to confirm your medications for the day. " +
        "Please confirm if you have taken your Aspirin, Cardivol, and Metformin today.",
      { voice: "alice", language: "en-US" }
    );

    // End the call after the message has been played
    response.hangup();

    res.type("text/xml");
    res.send(response.toString());
  },
};

export default voiceController;
