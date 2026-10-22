import { Router } from "express";
import { createUser, fetchUser, updateUser, deleteUser, deactivateUser } from "../controllers/usersController";
import { requireAuth } from "../middleware/authMiddlware";

const router = Router();

// Create
router.post("/create", requireAuth, createUser);

// Read
router.get("/", requireAuth, fetchUser);
router.get("/getUser", requireAuth, fetchUser); // legacy/compatibility endpoint
router.get("/:id", requireAuth, fetchUser);

// Update
router.put("/update", requireAuth, updateUser);
router.put("/update/:id", requireAuth, updateUser);
router.put("/:id", requireAuth, updateUser);
router.patch("/:id/deactivate", requireAuth, deactivateUser);

// Delete
router.delete("/delete/:id", requireAuth, deleteUser);
router.delete("/:id", requireAuth, deleteUser);

export default router;