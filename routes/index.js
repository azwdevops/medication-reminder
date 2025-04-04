import express from "express";
import apiRoutes from "./api.js";

const router = express.Router();

// Root Route
router.get("/", (req, res) => {
  res.send("Medication Reminder System API is running...");
});

// API Routes
router.use("/api", apiRoutes);

export default router;
