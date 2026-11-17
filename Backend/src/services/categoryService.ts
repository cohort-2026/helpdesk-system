import { pool } from "../config/database";

export const createCategory = async (
  departmentId: number,
  name: string,
  description: string | null,
  status: string
) => {
  const result = await pool.query(
    `INSERT INTO category (category_department_id, category_name, description, status)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [departmentId, name, description, status]
  );
  return result.rows[0];
};