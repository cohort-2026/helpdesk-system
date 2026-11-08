import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import * as userServices from "../services/userService";
import { sendTempPasswordEmail } from "../utils/emailService";

// Helper to determine which roles a logged-in admin can create/view/manage
const getAllowedTargetRoles = (adminRole: string): string[] => {
    if (adminRole === "Platform Admin") {
        return ["System Admin"];
    }
    if (adminRole === "System Admin") {
        return ["Department Lead", "Agent", "Employee"];
    }
    return [];
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authUser = (req as any).user;
        if (!authUser) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const allowedRoles = getAllowedTargetRoles(authUser.role);
        if (allowedRoles.length === 0) {
            return res.status(403).json({ message: "You do not have permission to create users." });
        }

        const { name, surname, email, department_id, role } = req.body;
        if (!name || !surname || !email || !role) {
            return res.status(400).json({ message: "Name, surname, email, and role are required." });
        }

        if (!allowedRoles.includes(role)) {
            const roleErrMsg = authUser.role === "Platform Admin"
                ? "Platform Admins can only create System Admins."
                : "System Admins can only create Department Leads, Agents, and Employees.";
            return res.status(403).json({ message: roleErrMsg });
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
            department_id: department_id ?? null
        });

        await sendTempPasswordEmail(email, tempPassword);

        console.log("tempPass: ", tempPassword);

        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json({ message: "User created successfully", user: userWithoutPassword });
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authUser = (req as any).user;
        if (!authUser) {
            return res.status(401).json({ message: "Not authenticated or user ID missing." });
        }

        const idToUpdate = req.params.id || authUser?.user_id;

        // If modifying someone else's account, verify role permissions
        if (idToUpdate !== authUser.user_id) {
            const allowedRoles = getAllowedTargetRoles(authUser.role);
            const targetUser = await userServices.findById(idToUpdate);
            if (!targetUser || !allowedRoles.includes(targetUser.role)) {
                return res.status(403).json({ message: "You do not have permission to modify this user." });
            }
            if (req.body.role && !allowedRoles.includes(req.body.role)) {
                return res.status(403).json({ message: "Cannot assign this role." });
            }
        }

        const { name, surname, email, password, role, active, department_id } = req.body;

        const updatePayload: any = {};
        if (name !== undefined && name.trim() !== "") updatePayload.name = name.trim();
        if (surname !== undefined && surname.trim() !== "") updatePayload.surname = surname.trim();
        if (email !== undefined && email.trim() !== "") updatePayload.email = email.trim();

        if (password !== undefined && password !== null) {
            const trimmedPassword = password.toString().trim();
            if (trimmedPassword !== "") {
                if (trimmedPassword.length < 6) {
                    return res.status(400).json({ message: "Password must be at least 6 characters long." });
                }
                updatePayload.password = trimmedPassword;
            }
        }

        // Only allow changing role/status/department if modifying other users (admin managing users)
        if (idToUpdate !== authUser.user_id) {
            if (role !== undefined) updatePayload.role = role;
            if (active !== undefined) updatePayload.active = active;
            if (department_id !== undefined) updatePayload.department_id = department_id;
        }

        if (Object.keys(updatePayload).length === 0) {
            return res.status(400).json({ message: "No valid fields provided for update." });
        }

        const updatedUser = await userServices.updateUser(idToUpdate, updatePayload);

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
    try {
        const authUser = (req as any).user;
        if (!authUser) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const allowedRoles = getAllowedTargetRoles(authUser.role);
        if (allowedRoles.length === 0) {
            return res.status(403).json({ message: "You do not have permission to view users." });
        }

        const rawId = req.params.id || (req.query.id as string);
        const id = Array.isArray(rawId) ? rawId[0] : rawId;
        if (id) {
            const user = await userServices.findById(id);
            if (!user || !allowedRoles.includes(user.role)) {
                return res.status(404).json({ message: "User not found." });
            }
            const { password: _, ...userWithoutPassword } = user;
            return res.status(200).json({ user: userWithoutPassword });
        }

        const users = await userServices.getAllUsers(allowedRoles);
        const sanitizedUsers = users
            .filter((u) => allowedRoles.includes(u.role))
            .map(({ password: _, ...u }) => u);

        res.status(200).json({ users: sanitizedUsers });
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authUser = (req as any).user;
        if (!authUser) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const rawId = req.params.id;
        const id = Array.isArray(rawId) ? rawId[0] : rawId;
        if (!id) {
            return res.status(400).json({ message: "User ID is required." });
        }

        const allowedRoles = getAllowedTargetRoles(authUser.role);
        const targetUser = await userServices.findById(id);
        if (!targetUser || !allowedRoles.includes(targetUser.role)) {
            return res.status(403).json({ message: "You do not have permission to delete this user." });
        }

        const success = await userServices.deleteUser(id);
        if (!success) {
            return res.status(404).json({ message: "User not found or deletion failed." });
        }
        res.status(200).json({ message: "User deleted successfully." });
    } catch (error) {
        next(error);
    }
};

export const deactivateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authUser = (req as any).user;
        if (!authUser) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const rawId = req.params.id;
        const id = Array.isArray(rawId) ? rawId[0] : rawId;
        if (!id) {
            return res.status(400).json({ message: "User ID is required." });
        }

        const allowedRoles = getAllowedTargetRoles(authUser.role);
        const targetUser = await userServices.findById(id);
        if (!targetUser || !allowedRoles.includes(targetUser.role)) {
            return res.status(403).json({ message: "You do not have permission to deactivate this user." });
        }

        const updatedUser = await userServices.updateUser(id, { active: false });
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found or deactivation failed." });
        }
        const { password: _, ...userWithoutPassword } = updatedUser;
        res.status(200).json({ message: "User deactivated successfully.", user: userWithoutPassword });
    } catch (error) {
        next(error);
    }
};