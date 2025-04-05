import express from "express";
import voiceController from "#controllers/voiceController.js";
import responseController from "#controllers/responseController.js";

const router = express.Router();

// Voice and Call Routes
// Route to handle incoming voice request (e.g., play a message and record response)
router.post("/voice", voiceController.handleVoiceRequest);

// Route to initiate a call to a phone number
router.post("/call", voiceController.initiateCall);

// Route to handle the status of a call (e.g., completed, busy, no-answer)
router.post("/call-status", voiceController.handleCallStatus);

// Route to save the transcription of the call's response
router.post("/transcription", voiceController.saveTranscription);

// Route to handle incoming calls and play a message
router.post("/incoming-call", voiceController.incomingCall);

// Response Analysis Routes
// Route to fetch all saved responses from the database
router.get("/responses", responseController.getAllResponses);

// Route to analyze the saved responses (e.g., count "confirmed" vs "unclear")
router.get("/analyze-responses", responseController.analyzeResponses);

export default router;
