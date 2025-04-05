import twilio from "twilio";

// Twilio Config
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const twilioService = {
  makeCall: async (phoneNumber) => {
    return await twilioClient.calls.create({
      url: `${process.env.SERVER_URL}/api/voice`, // TwiML for call handling
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
      record: true,
      statusCallback: `${process.env.SERVER_URL}/api/call-status`, // Notify when call ends
      statusCallbackEvent: ["completed", "no-answer", "busy", "failed", "canceled"], // Monitor these statuses
      statusCallbackMethod: "POST",
    });
  },

  sendMissedCallSMS: async (phoneNumber) => {
    try {
      await twilioClient.messages.create({
        body: `You missed a medication reminder call. Reply with 'YES' if you've taken your medication or 'NO' if you haven't.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      });
      console.log(`SMS Sent to ${phoneNumber}`);
    } catch (error) {
      console.error("Failed to send SMS:", error.message);
    }
  },
};

export default twilioService;
