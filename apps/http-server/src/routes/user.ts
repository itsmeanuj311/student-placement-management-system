import { Router } from "express";
import { deleteProfile } from "../controllers/user/deleteProfile.js";
import { getProfile } from "../controllers/user/getProfile.js";
import { leaveOrganization } from "../controllers/user/leaveOrganization.js";
import { updateProfile } from "../controllers/user/updateProfile.js";

const router = Router();

router.get("/me", getProfile);
router.patch("/me", updateProfile);
router.delete("/me", deleteProfile);
router.delete("/me/org", leaveOrganization);

export default router;
