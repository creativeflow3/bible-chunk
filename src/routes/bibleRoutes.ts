import { Router } from "express";
import {
  getBibleChunks,
  uploadBibleToPinecone,
} from "../controllers/bibleController.ts";

const router = Router();

router.get("/chunks", getBibleChunks);
router.post("/upload", uploadBibleToPinecone);

export default router;
