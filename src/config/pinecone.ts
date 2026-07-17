import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.PINECONE_API_KEY) {
  throw new Error("Missing PINECONE_API_KEY in environment variables.");
}

if (!process.env.PINECONE_INDEX) {
  throw new Error("Missing PINECONE_INDEX in environment variables.");
}

// 1. Export the initialized client
export const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

// 2. Export the index name for global access
export const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX;
