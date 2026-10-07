import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { login, me, registerUser } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/register", asyncHandler(registerUser));
router.post("/login", asyncHandler(login));
router.get("/me", requireAuth, asyncHandler(me));

export default router;

