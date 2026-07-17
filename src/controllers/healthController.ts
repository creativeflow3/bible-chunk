import { type Request, type Response } from "express";
import { pinecone } from "../config/pinecone.ts";

export const getHealth = async (req: Request, res: Response): Promise<void> => {
  // 1. Prevent caching so CDNs or load balancers always get fresh status
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  const healthStatus: any = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: `${process.uptime().toFixed(2)} seconds`, // Node process uptime
    checks: {
      server: "UP",
      pinecone: "UNKNOWN",
    },
  };

  try {
    // 2. Perform a lightweight connection check with Pinecone
    // listIndexes() is a quick, read-only administrative metadata call
    await pinecone.listIndexes();
    healthStatus.checks.pinecone = "UP";

    res.status(200).json(healthStatus);
  } catch (error: any) {
    // If Pinecone fails or credentials are bad, mark it down
    healthStatus.status = "unhealthy";
    healthStatus.checks.pinecone = "DOWN";
    healthStatus.error = error.message;

    // 503 Service Unavailable is the standard healthy/unhealthy indicator
    res.status(503).json(healthStatus);
  }
};
