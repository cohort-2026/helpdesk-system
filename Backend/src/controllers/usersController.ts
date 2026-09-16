import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import * as userServices from "../services/userService";
import { sendTempPasswordEmail } from "../utils/emailService";
import { CLIENT_RENEG_LIMIT } from "tls";

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, surname, email, department_id, role } = req.body;
        if (!name || !surname || !email || !role || !department_id) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const existingUser = await userServices.findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: "User already exists with this email." });
        }

        const tempPassword = crypto.randomBytes(4).toString('hex'); 

        const user_id = Date.now().toString(); 

        const newUser = await userServices.createUser({
            user_id,
            name,
            surname,
            email,
            password: tempPassword,
            role,
            active: true,
            department_id
        });

        // await sendTempPasswordEmail(email, tempPassword);

        console.log("tempPass: ", tempPassword)

        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json({ message: "User created successfully", user: userWithoutPassword });
    } catch (error) {
        next(error);
    }
};


export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authUser = (req as any).user;
        
        const idToUpdate = req.params.id || authUser?.user_id;
        
        if (!idToUpdate) {
            return res.status(401).json({ message: "Not authenticated or user ID missing." });
        }

        const { name, surname, email, password, role, active, department_id } = req.body;

        const updatedUser = await userServices.updateUser(idToUpdate, {
            name, surname, email, password, role, active, department_id
        });

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found or update failed." });
        }

        const { password: _, ...userWithoutPassword } = updatedUser;
        res.status(200).json({ message: "User updated successfully", user: userWithoutPassword });
    } catch (error) {
        next(error);
    }
};

export const fetchUser = async (req: Request, res: Response, next: NextFunction) => {
    res.status(501).json({ message: "coming soon" });
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    res.status(501).json({ message: "coming soon" });
};

export const deactivateUser = async (req: Request, res: Response, next: NextFunction) => {
    res.status(501).json({ message: "coming soon" });
};