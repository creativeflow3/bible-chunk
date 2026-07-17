import { type Request, type Response } from "express";
import { BibleService } from "../services/bibleService.ts";

const bibleService = new BibleService();

export const getBibleChunks = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const chunks = bibleService.getChaptersAsChunks();
    res.status(200).json({ totalChunks: chunks.length, data: chunks });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadBibleToPinecone = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { indexName, namespace } = req.body || {};
    /*
    if (!indexName) {
      res.status(400).json({ error: "Missing indexName in request body" });
      return;
    }
    */
    const result = await bibleService.uploadToPinecone(indexName, namespace);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
