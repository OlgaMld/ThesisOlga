import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  applyToJob,
  evaluateJobApplications,
  listJobApplications,
  listMyApplications
} from "../controllers/applicationController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.post("/", requireAuth, requireRole("candidate"), asyncHandler(applyToJob));
router.get("/mine", requireAuth, requireRole("candidate"), asyncHandler(listMyApplications));
router.get("/job/:jobId", requireAuth, requireRole("admin"), asyncHandler(listJobApplications));
router.post(
  "/job/:jobId/evaluate",
  requireAuth,
  requireRole("admin"),
  asyncHandler(evaluateJobApplications)
);

export default router;
