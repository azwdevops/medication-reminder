import CallResponse from "#models/callResponse.js";

const responseController = {
  getAllResponses: async (req, res) => {
    try {
      const responses = await CallResponse.find(); // Fetch all call responses
      res.status(200).json(responses);
    } catch (error) {
      console.error("Error fetching responses:", error);
      res.status(500).json({ error: "Failed to fetch responses" });
    }
  },

  analyzeResponses: async (req, res) => {
    try {
      const responses = await CallResponse.find();

      let confirmedCount = 0;
      let unclearCount = 0;

      responses.forEach((response) => {
        // Simple analysis logic: Check if certain keywords like "yes" or "taken" are in the transcription
        const transcription = response.transcription.toLowerCase();

        if (transcription.includes("yes") || transcription.includes("taken")) {
          confirmedCount++;
        } else if (transcription.includes("no") || transcription.includes("unclear")) {
          unclearCount++;
        }
      });

      res.status(200).json({
        totalResponses: responses.length,
        confirmedCount,
        unclearCount,
      });
    } catch (error) {
      console.error("Error analyzing responses:", error);
      res.status(500).json({ error: "Failed to analyze responses" });
    }
  },
};

export default responseController;
