import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/authMiddlware";
import {
  create,
  getAll,
  getOne,
  getByDepartment,
  update,
  remove,
} from "../controllers/categoryController";

const router = Router();

// All category routes require an authenticated user
router.use(requireAuth);

// Read-only endpoints accessible by any authenticated employee/user
router.get("/", getAll);
router.get("/:id", getOne);

// Write endpoints (create, update, delete) restricted to System Admin
router.post("/", requireRole("System Admin"), create);
router.put("/:id", requireRole("System Admin"), update);
router.delete("/:id", requireRole("System Admin"), remove);

export default router;

