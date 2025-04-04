import "dotenv/config";
import express from "express";
import cors from "cors";
import { dbConnect } from "./utils/dbConnect.js";
import routes from "./routes/index.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // To handle URL-encoded data

// Routes
app.use("/", routes);

// Connect to database
dbConnect();

const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
