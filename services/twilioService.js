import twilio from "twilio";

// Twilio Config
// Initialize the Twilio client with the Account SID and Auth Token from environment variables
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const twilioService = {
  // Method to make a call to a specified phone number
  makeCall: async (phoneNumber) => {
    return await twilioClient.calls.create({
      url: `${process.env.SERVER_URL}/api/voice`, // URL for TwiML that handles the call
      to: phoneNumber, // The phone number to call
      from: process.env.TWILIO_PHONE_NUMBER, // The phone number to use as the caller ID
      record: true, // Record the call
      statusCallback: `${process.env.SERVER_URL}/api/call-status`, // Callback URL to notify when call ends
      statusCallbackEvent: ["completed", "no-answer", "busy", "failed", "canceled"], // Events to monitor for call status
      statusCallbackMethod: "POST", // Use POST to send the status updates
    });
  },

  // Method to send an SMS to a phone number if a call is missed
  sendMissedCallSMS: async (phoneNumber) => {
    try {
      await twilioClient.messages.create({
        body: `You missed a medication reminder call. Reply with 'YES' if you've taken your medication or 'NO' if you haven't.`,
        from: process.env.TWILIO_PHONE_NUMBER, // Twilio phone number to send the SMS from
        to: phoneNumber, // The phone number to send the SMS to
      });
      console.log(`SMS Sent to ${phoneNumber}`);
    } catch (error) {
      console.error("Failed to send SMS:", error.message); // Log any error that occurs
    }
  },
};

export default twilioService;
