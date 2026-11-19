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

export const getCategoriesByDepartment = async (
  departmentId: number,
  status: string | null
) => {
  const result = await pool.query(
    `SELECT * FROM category
     WHERE category_department_id = $1
       AND ($2::text IS NULL OR status = $2)
     ORDER BY category_name`,
    [departmentId, status]
  );
  return result.rows;
};

export const getCategoryById = async (id: number) => {
  const result = await pool.query(
    "SELECT * FROM category WHERE category_id = $1",
    [id]
  );
  return result.rows[0];
};

export const updateCategory = async (
  id: number,
  name: string | null,
  description: string | null,
  status: string | null
) => {
  const result = await pool.query(
    `UPDATE category
     SET category_name = COALESCE($1, category_name),
         description = COALESCE($2, description),
         status = COALESCE($3, status),
         updated_at = NOW()
     WHERE category_id = $4
     RETURNING *`,
    [name, description, status, id]
  );
  return result.rows[0];
};

export const categoryIsUsed = async (id: number) => {
  const result = await pool.query(
    "SELECT 1 FROM ticket WHERE ticket_category_id = $1 LIMIT 1",
    [id]
  );
  return result.rows.length > 0;
};

export const deleteCategory = async (id: number) => {
  const result = await pool.query(
    "DELETE FROM category WHERE category_id = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
};