import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bibleRouter from "./routes/bibleRoutes.ts";
import healthRouter from "./routes/healthRoutes.ts"; // <-- Import here!

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 1. Healthcheck is registered on /health or /api/health
app.use("/health", healthRouter);

// 2. Main functional routes
app.use("/api/bible", bibleRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
