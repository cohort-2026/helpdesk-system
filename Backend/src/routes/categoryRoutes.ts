import { Router, Request, Response, NextFunction } from "express";
import { requireAuth } from "../middleware/authMiddlware";
import { createCategory,
    getCategories,
    getCategory,
    updateCategory,
    deleteCategory } from "../controllers/categoryController";

const router = Router();

const adminOrLead = (req: Request, res: Response, next: NextFunction) => {
  const role = (req as any).user?.role;
  if (role === "System Admin" || role === "Department Lead") {
    return next();
  }
  return res.status(403).json({ message: "Forbidden" });
};

router.use(requireAuth);
router.post("/", adminOrLead, createCategory);
router.get("/", adminOrLead, getCategories);
router.get("/:id", adminOrLead, getCategory);
router.put("/:id", adminOrLead, updateCategory);
router.patch("/:id", adminOrLead, updateCategory);
router.delete("/:id", adminOrLead, deleteCategory);

export default router;