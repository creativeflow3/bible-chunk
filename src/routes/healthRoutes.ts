import { Router } from "express";
import { getHealth } from "../controllers/healthController.ts";

const router = Router();

// Standard healthcheck endpoint
router.get("/", getHealth);

export default router;
