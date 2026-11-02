import { pool } from "../config/database";

export const createDepartment = async (
  name: string,
  description: string | null,
  status: string,
  leadId: string | null
) => {
  const result = await pool.query(
    `INSERT INTO department (department_name, description, status, lead_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, description, status, leadId]
  );
  return result.rows[0];
};

export const getDepartments = async (
  page: number,
  limit: number,
  status: string | null,
  search: string | null
) => {
  const where = "WHERE ($1::text IS NULL OR status = $1) AND ($2::text IS NULL OR department_name ILIKE '%' || $2 || '%')";

  const data = await pool.query(
    `SELECT * FROM department ${where} ORDER BY department_name LIMIT $3 OFFSET $4`,
        [status, search, limit, (page - 1) * limit]
  );
  const count = await pool.query(
    `SELECT COUNT(*)::int AS total FROM department ${where}`,
        [status, search]
  );

  return { departments: data.rows, total: count.rows[0].total };
};

export const getDepartmentById = async (id: number) => {
  const result = await pool.query(
    "SELECT * FROM department WHERE department_id = $1",
    [id]
  );
  return result.rows[0];
};

export const updateDepartment = async (
  id: number,
  name: string | null,
  description: string | null,
) => {
  const result = await pool.query(
    `UPDATE department
     SET department_name = COALESCE($1, department_name),
      description = COALESCE($2,description),
         updated_at = NOW()
     WHERE department_id = $3
     RETURNING *`,
    [name, description, id]
  );
  return result.rows[0];
};

export const softDeleteDepartment = async (id: number) => {
  const result = await pool.query(
    "UPDATE department SET status = 'inactive', updated_at = NOW() WHERE department_id = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
};
