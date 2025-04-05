import CallResponse from "#models/callResponse.js";

/**
 * This is the controller that handles everything related to call responses.
 * It has methods for fetching all responses and analyzing them.
 */
const responseController = {
  /**
   * Gets all the call responses from the database and sends them back.
   *
   * @param {Object} req - The request object (we're not using it here).
   * @param {Object} res - The response object to send back the data.
   * @returns {void} Sends back all the responses as JSON or an error message if something goes wrong.
   */
  getAllResponses: async (req, res) => {
    try {
      // Get all call responses from the database
      const responses = await CallResponse.find();

      // Send the responses back as JSON with a success status
      res.status(200).json(responses);
    } catch (error) {
      // If something goes wrong, log it and send a failure message
      console.error("Error fetching responses:", error);
      res.status(500).json({ error: "Failed to fetch responses" });
    }
  },

  /**
   * Analyzes all the responses to count how many are confirmed and how many are unclear.
   *
   * @param {Object} req - The request object (again, not used in this case).
   * @param {Object} res - The response object where we send the analysis results.
   * @returns {void} Sends back the analysis results or an error message if something goes wrong.
   */
  analyzeResponses: async (req, res) => {
    try {
      // Fetch all responses from the database
      const responses = await CallResponse.find();

      let confirmedCount = 0;
      let unclearCount = 0;

      // Loop through each response to do a simple analysis
      responses.forEach((response) => {
        // Turn the transcription to lowercase to make it easier to match words
        const transcription = response.transcription.toLowerCase();

        // If "yes" or "taken" is mentioned, we count it as confirmed
        if (transcription.includes("yes") || transcription.includes("taken")) {
          confirmedCount++;
        }
        // If "no" or "unclear" comes up, we count it as unclear
        else if (transcription.includes("no") || transcription.includes("unclear")) {
          unclearCount++;
        }
      });

      // Send the analysis results back as JSON with a success status
      res.status(200).json({
        totalResponses: responses.length,
        confirmedCount,
        unclearCount,
      });
    } catch (error) {
      // If something goes wrong, log the error and send a failure message
      console.error("Error analyzing responses:", error);
      res.status(500).json({ error: "Failed to analyze responses" });
    }
  },
};

export default responseController;
