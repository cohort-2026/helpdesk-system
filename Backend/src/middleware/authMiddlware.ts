import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import * as userServices from "../services/userService";

const COOKIE_NAME = "session";

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    let token = req.cookies?.[COOKIE_NAME];
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }
    // console.log("Middleware token received:", token);
    if (!token) {
        return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as { id: string; email: string; role: string };
        const user = await userServices.findUserByEmail(decoded.email);
        if (!user) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        const { password: _, ...userWithoutPassword } = user;
        req.user = userWithoutPassword;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Not authenticated" });
    }
};

export const requireRoles = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "Forbidden" });
        }
        next();
    };
};

export const requireRole = (...roles: string[]) => requireRoles(...roles);

