import { Router } from "express";
import { createUser, fetchUser, updateUser, deleteUser, deactivateUser } from "../controllers/usersController";
import { requireAuth } from "../middleware/authMiddlware";

const router = Router()

router.post("/create", createUser); //need to add middleware
router.get("/getUser", fetchUser);
router.put("/update", requireAuth, updateUser);
router.put("/update/:id", requireAuth, updateUser);

export default router;