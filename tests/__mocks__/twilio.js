export default {
  // Mocking the `calls.create` method from Twilio
  // This simulates the creation of a call and returns a mock response with a fake SID
  calls: {
    create: jest.fn().mockResolvedValue({ sid: "MOCK_CALL_SID" }), // Returns a mock call SID
  },

  // Mocking the `messages.create` method from Twilio
  // This simulates sending an SMS and returns a mock response with a fake SID
  messages: {
    create: jest.fn().mockResolvedValue({ sid: "MOCK_SMS_SID" }), // Returns a mock SMS SID
  },
};
