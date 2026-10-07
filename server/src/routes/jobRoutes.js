import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createJob, listAdminJobs, listPublicJobs } from "../controllers/jobController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", asyncHandler(listPublicJobs));
router.get("/mine", requireAuth, requireRole("admin"), asyncHandler(listAdminJobs));
router.post("/", requireAuth, requireRole("admin"), asyncHandler(createJob));

export default router;

