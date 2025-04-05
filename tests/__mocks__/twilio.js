export default {
  calls: {
    create: jest.fn().mockResolvedValue({ sid: "MOCK_CALL_SID" }),
  },
  messages: {
    create: jest.fn().mockResolvedValue({ sid: "MOCK_SMS_SID" }),
  },
};
