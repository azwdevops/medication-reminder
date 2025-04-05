import twilio from "twilio";
import CallResponse from "#models/callResponse.js";
import twilioService from "#services/twilioService.js";

const voiceController = {
  /**
   * Handles the incoming voice request from Twilio.
   * This will play a medication reminder and record the patient's response.
   *
   * @param {Object} req - The incoming request object from Twilio.
   * @param {Object} res - The response object that Twilio expects in XML format.
   * @returns {void} Sends back an XML response to Twilio with the voice message and recording instructions.
   */
  handleVoiceRequest: (req, res) => {
    const { VoiceResponse } = twilio.twiml;
    const response = new VoiceResponse();

    // Welcome the patient and ask them to confirm if they've taken their meds today.
    response.say(
      "Hello, this is a reminder from your healthcare provider to confirm your medications for the day. " +
        "Please confirm if you have taken your Aspirin, Cardivol, and Metformin today.",
      { voice: "alice", language: "en-US" }
    );

    // Set up a recording for the patient's response
    response.record({
      maxLength: 30, // Limit the recording to 30 seconds.
      transcribe: true, // Automatically transcribe the response.
      transcribeCallback: "/api/transcription", // Where the transcription will be sent.
      action: "/api/call-status", // Redirect to this endpoint if the call is not answered.
      timeout: 10, // Wait for 10 seconds before assuming there was no answer.
    });

    // Send the generated response back to Twilio in XML format.
    res.type("text/xml").send(response.toString());
  },

  /**
   * Initiates an outbound call to a given phone number using Twilio.
   *
   * @param {Object} req - The request object containing the phone number to call.
   * @param {Object} res - The response object where we send back the call status.
   * @returns {void} Sends back a JSON response with the call SID or an error message.
   */
  initiateCall: async (req, res) => {
    const { phoneNumber } = req.body;

    // Check if the phone number is provided, otherwise send an error.
    if (!phoneNumber) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    try {
      // Attempt to make the call using Twilio's service.
      const call = await twilioService.makeCall(phoneNumber);
      console.log(`📞 Call initiated - SID: ${call.sid} to ${phoneNumber}`);
      res.json({ message: "Call initiated", callSid: call.sid });
    } catch (error) {
      // Log the error and send a failure response if the call fails.
      console.error("Error making call:", error.message);
      res.status(500).json({ error: "Failed to initiate call" });
    }
  },

  /**
   * Handles the status update of a call (e.g., completed, no answer, etc.).
   *
   * @param {Object} req - The request object containing the status update for the call.
   * @param {Object} res - The response object to acknowledge the status update.
   * @returns {void} Sends back a simple OK response.
   */
  handleCallStatus: async (req, res) => {
    const { Called, CallSid, CallStatus } = req.body;

    console.log(`Call Status Update: ${CallStatus} | Number: ${Called} | Call SID: ${CallSid}`);

    // Handle the different possible statuses of the call
    switch (CallStatus) {
      case "completed":
        // Log when the call is completed successfully
        console.log(`Call was successfully completed with Call SID: ${CallSid}`);
        break;

      case "no-answer":
      case "busy":
      case "failed":
        // If the call was unsuccessful, send an SMS reminder
        console.log(`Call to ${Called} was not successful. Sending SMS Reminder...`);
        await twilioService.sendMissedCallSMS(Called);
        break;

      case "canceled":
        // Log if the call was canceled
        console.log(`Call to ${Called} was canceled.`);
        break;

      default:
        // Log any unexpected call status
        console.log(`Unknown call status received: ${CallStatus}`);
    }

    res.status(200).send("OK"); // Send a simple OK response to acknowledge receipt.
  },

  /**
   * Saves the transcription of a patient's call response.
   *
   * @param {Object} req - The request object containing call details and transcription data.
   * @param {Object} res - The response object that acknowledges the saving of transcription.
   * @returns {void} Sends back a success or failure message depending on the outcome.
   */
  saveTranscription: async (req, res) => {
    const { To, CallSid, TranscriptionText, CallStatus, RecordingUrl } = req.body;

    try {
      // Create a new CallResponse object with the provided data.
      const response = new CallResponse({
        phoneNumber: To,
        callSid: CallSid,
        transcription: TranscriptionText || "No transcription available", // Handle missing transcription.
        callStatus: CallStatus,
        recordingUrl: RecordingUrl,
      });

      // Save the transcription to the database.
      await response.save();
      console.log("Transcription saved:", response);

      // Respond with a success message.
      res.status(200).json({ message: "Transcription saved successfully" });
    } catch (error) {
      // Handle any errors while saving the transcription.
      console.error("Error saving transcription:", error);
      res.status(500).json({ error: "Failed to save transcription" });
    }
  },

  /**
   * Handles incoming calls, plays a reminder message, and then ends the call.
   *
   * @param {Object} req - The incoming request object representing the call.
   * @param {Object} res - The response object to send back Twilio's expected XML.
   * @returns {void} Sends back an XML response to play a message and hang up.
   */
  incomingCall: async (req, res) => {
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();

    // Play the predefined medication reminder when the patient calls in.
    response.say(
      "Hello, this is a reminder from your healthcare provider to confirm your medications for the day. " +
        "Please confirm if you have taken your Aspirin, Cardivol, and Metformin today.",
      { voice: "alice", language: "en-US" }
    );

    // End the call after the message is played.
    response.hangup();

    console.log("Call to medication system was successful");

    res.type("text/xml");
    res.send(response.toString()); // Send the response in XML format to Twilio.
  },
};

export default voiceController;
