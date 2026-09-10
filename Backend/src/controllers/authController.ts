import { Request, Response, NextFunction } from "express";
import * as userServices from "../services/userService";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const jwtSecret = "secret";

export const register = async (req: Request, res: Response, next: NextFunction) => {
    const {name, surname, email, password, role, department_id} = req.body
    if(!name || !surname || !email || !password || !role) {
        return res.status(400).json({message: "All fields are required"})
    }

    try {
        const existingUser = await userServices.findUserByEmail(email);
        if(existingUser) {
            return res.status(400).json({message: "User already exists"})
        }
        const user_id = Date.now().toString();
        const newUser = await userServices.createUser({
            user_id,
            name,
            surname,
            email,
            password,
            role,
            active: true,
            department_id
        })
        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json({message: "User created successfully", user: userWithoutPassword})
    } catch (error) {
        next(error)
    }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
    const {email, password} = req.body
    if(!email || !password) {
        return res.status(400).json({message: "All fields are required"})
    }

    try {
        const user = await userServices.findUserByEmail(email);
        if(!user) {
            return res.status(404).json({message: "User not found"})
        }
        if(!user.active) {
            return res.status(403).json({message: "User is inactive"})
        }
        const isPasswordValid = await bcrypt.compare(password, user.password || "");
        if(!isPasswordValid) {
            return res.status(401).json({message: "Invalid password"})
        }
        const token = jwt.sign({id: user.user_id, email: user.email, role: user.role}, process.env.JWT_SECRET || "secret", {expiresIn: "1h"})
        const { password: _, ...userWithoutPassword } = user;
        res.status(200).json({token, user: userWithoutPassword})
    } catch (error) {
        next(error)
    }
}
export const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(200).json({message: "Logged out successfully"})
    } catch (error) {
        next(error)
    }
}

export const me = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({message: "Not authenticated"})
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as { id: string; email: string; role: string };
        const user = await userServices.findUserByEmail(decoded.email);
        if(!user) {
            return res.status(401).json({message: "Not authenticated"})
        }
        const { password: _, ...userWithoutPassword } = user;
        res.status(200).json({user: userWithoutPassword})
    } catch (error) {
        return res.status(401).json({message: "Not authenticated"})
    }
}