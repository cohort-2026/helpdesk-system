import { query } from "../config/database";
import bcrypt from "bcryptjs";
import { User, CreateUserDto, UpdateUserDto } from "../types/user.types";

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const { rows } = await query("SELECT * FROM users WHERE email = $1", [email]);
  return rows[0] || null;
};

export const createUser = async (userData: CreateUserDto): Promise<User> => {
  const { user_id, name, surname, email, password, role = 'Employee', active = true, department_id = null } = userData;
  const hashedPassword = password ? await bcrypt.hash(password, 10) : '';
  const { rows } = await query(
    "INSERT INTO users (user_id, name, surname, email, password, role, active, department_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
    [user_id, name, surname, email, hashedPassword, role, active, department_id]
  );
  return rows[0];
};

export const setResetToken = async (userId: string, token: string, expiry: Date) => {
  await query(
    "UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE user_id = $3",
    [token, expiry, userId]
  );
};
export const findUserByResetToken = async (token: string) => {
  const result = await query("SELECT * FROM users WHERE reset_token = $1", [token]);
  return result.rows[0];
};

export const updatePasswordAndClearToken = async (userId: string, hashedPassword: string) => {
  await query(
    "UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE user_id = $2",
    [hashedPassword, userId]
  );
};
