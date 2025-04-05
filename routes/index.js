import express from "express";
import apiRoutes from "./api.js";

const router = express.Router();

// Root Route
// This is the base route that will respond with a simple message to confirm the API is up and running
router.get("/", (req, res) => {
  res.send("Medication Reminder System API is running...");
});

// API Routes
// This is where the "/api" prefix is used to route API-related requests to the apiRoutes module
router.use("/api", apiRoutes);

export default router;
