import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/authMiddlware";
import { create, getAll, getOne, update, remove } from "../controllers/departmentController";

const router = Router();

//router.use(requireAuth, requireRole("System Admin"));
router.post("/", create);
router.get("/", getAll);
router.get("/:id", getOne);
router.put("/:id", update);
router.patch("/:id", update);
router.delete("/:id", remove);
export default router;