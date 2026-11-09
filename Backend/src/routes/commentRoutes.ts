import { Router } from "express";
import { editComment, deleteComment } from "../controllers/ticketsController";
import { requireAuth } from "../middleware/authMiddlware";

const router = Router();

router.use(requireAuth);

// PATCH /api/comments/:id
router.patch("/:id", editComment);

// DELETE /api/comments/:id
router.delete("/:id", deleteComment);

export default router;

