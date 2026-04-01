import { Router } from "express";
import { createApplication } from "../controllers/application/createApplication.js";
import { getApplication } from "../controllers/application/getApplication.js";
import { updateApplication } from "../controllers/application/updateApplication.js";

const router = Router();

router.get("/", getApplication);
router.post("/", createApplication);
router.get("/:id", getApplication);
router.patch("/:id", updateApplication);

export default router;
