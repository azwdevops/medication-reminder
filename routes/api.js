import express from "express";
import voiceController from "#controllers/voiceController.js";
import responseController from "#controllers/responseController.js";

const router = express.Router();

// Voice and Call Routes
router.post("/voice", voiceController.handleVoiceRequest);
router.post("/call", voiceController.initiateCall);
router.post("/call-status", voiceController.handleCallStatus);
router.post("/transcription", voiceController.saveTranscription);

router.post("/incoming-call", voiceController.incomingCall);

// Response Analysis Routes
router.get("/responses", responseController.getAllResponses);
router.get("/analyze-responses", responseController.analyzeResponses);

export default router;
