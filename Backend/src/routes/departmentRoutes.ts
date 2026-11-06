import { Router, Request, Response, NextFunction } from "express";
import { requireAuth, requireRole } from "../middleware/authMiddlware";
import { create, getAll, getOne, update, remove,assignLead, removeLead, addMembers, removeMember } from "../controllers/departmentController";

const router = Router();
const adminOnly = requireRole("System Admin");

const adminOrLead = (req: Request, res: Response, next: NextFunction) => {
  const role = (req as any).user?.role;
  if (role === "System Admin" || role === "Department Lead") {
    return next();
  }
  return res.status(403).json({ message: "Forbidden" });
};

router.use(requireAuth);
router.post("/", adminOnly, create);
router.get("/", getAll); // Allow all authenticated users to view departments
router.get("/:id", adminOnly, getOne);
router.put("/:id", adminOnly, update);
router.patch("/:id", adminOnly, update);
router.delete("/:id", adminOnly, remove);

router.put("/:id/lead", adminOnly, assignLead);
router.patch("/:id/lead", adminOnly, assignLead);
router.delete("/:id/lead", adminOnly, removeLead);

router.post("/:id/members", adminOrLead, addMembers);
router.delete("/:id/members/:userId", adminOrLead, removeMember);
export default router;