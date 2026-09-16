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

export const findById = async (user_id: string): Promise<User | null> => {
  const { rows } = await query("SELECT * FROM users WHERE user_id = $1", [user_id]);
  return rows[0] || null;
};

export const updateUser = async (user_id: string, updateData: UpdateUserDto): Promise<User | null> => {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(updateData)) {
    if (value !== undefined) {
      if (key === 'password') {
        const hashedPassword = await bcrypt.hash(value, 10);
        fields.push(`${key} = $${paramIndex}`);
        values.push(hashedPassword);
      } else {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
      }
      paramIndex++;
    }
  }

  if (fields.length === 0) return null; 

  values.push(user_id);
  const updateQuery = `UPDATE users SET ${fields.join(', ')} WHERE user_id = $${paramIndex} RETURNING *`;
  
  const { rows } = await query(updateQuery, values);
  return rows[0] || null;
};
