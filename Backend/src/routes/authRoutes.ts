import { register, login, logout, me } from "../controllers/authController";
import { requireAuth } from "../middleware/authMiddlware";
import { Router } from "express";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", me);
router.get("/protected-test", requireAuth, (req, res) => {
    res.status(200).json({ message: "You got through the middleware", user: req.user }); // Added to test the middleware 
});

export default router;