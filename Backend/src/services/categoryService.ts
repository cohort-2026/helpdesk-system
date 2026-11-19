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

export const getAllCategories = async () => {
  const result = await pool.query(`SELECT * FROM category`);
  return result.rows;
}

export const getCategoryById = async (id: number) => {
  const result = await pool.query(
    "SELECT * FROM category WHERE category_id = $1",
    [id]
  );
  return result.rows[0];
};

