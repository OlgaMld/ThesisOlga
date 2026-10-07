import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { listMyCvs, uploadCv } from "../controllers/cvController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { pdfUpload } from "../middleware/upload.js";

const router = Router();

router.get("/mine", requireAuth, requireRole("candidate"), asyncHandler(listMyCvs));
router.post(
  "/upload",
  requireAuth,
  requireRole("candidate"),
  pdfUpload.single("cv"),
  asyncHandler(uploadCv)
);

export default router;

