
import { Request, Response, NextFunction } from "express";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;
  const errors: string[] = [];

  if (!name || typeof name !== "string" || name.trim().length === 0) {
     errors.push("Name is required.");

  } else if (name.trim().length < 2) {
     errors.push("Name must be at least 2 characters long.");
  }

   if (!email || typeof email !== "string" || email.trim().length === 0) {
     errors.push("Email is required.");

  } else if (!EMAIL_REGEX.test(email.trim())) {
     errors.push("Please provide a valid email address.");
  }

  if (!password || typeof password !== "string" || password.length === 0) {
     errors.push("Password is required.");

  } else {
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long.");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter.");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter.");
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number.");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: "Validation failed", errors });
  }

  next();
};