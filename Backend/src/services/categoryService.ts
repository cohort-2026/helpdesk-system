import { pool } from "../config/database";

const CATEGORY_WITH_DEPARTMENT = `
  SELECT c.*, d.department_name
  FROM category c
  LEFT JOIN department d ON d.department_id = c.category_department_id
`;

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
    `${CATEGORY_WITH_DEPARTMENT}
     WHERE c.category_department_id = $1
       AND ($2::text IS NULL OR c.status = $2)
     ORDER BY c.category_name`,
    [departmentId, status]
  );
  return result.rows;
};

export const getAllCategories = async (status: string | null) => {
  const result = await pool.query(
    `${CATEGORY_WITH_DEPARTMENT}
     WHERE ($1::text IS NULL OR c.status = $1)
     ORDER BY c.category_name`,
    [status]
  );
  return result.rows;
};

export const getCategoryById = async (id: number) => {
  const result = await pool.query(
    `${CATEGORY_WITH_DEPARTMENT}
     WHERE c.category_id = $1`,
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