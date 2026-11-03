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
  const where = "WHERE ($1::text IS NULL OR d.status = $1) AND ($2::text IS NULL OR d.department_name ILIKE '%' || $2 || '%')";

  const data = await pool.query(
    `SELECT d.*, 
            CASE WHEN u.user_id IS NOT NULL THEN TRIM(CONCAT(u.name, ' ', u.surname)) ELSE NULL END AS "departmentLead",
            u.name AS lead_name,
            u.surname AS lead_surname,
            u.email AS lead_email
     FROM department d
     LEFT JOIN users u ON d.lead_id::text = u.user_id::text
     ${where}
     ORDER BY d.department_name
     LIMIT $3 OFFSET $4`,
    [status, search, limit, (page - 1) * limit]
  );
  const count = await pool.query(
    `SELECT COUNT(*)::int AS total FROM department d ${where}`,
    [status, search]
  );

  return { departments: data.rows, total: count.rows[0].total };
};

export const getDepartmentById = async (id: number) => {
  const result = await pool.query(
    `SELECT d.*, 
            CASE WHEN u.user_id IS NOT NULL THEN TRIM(CONCAT(u.name, ' ', u.surname)) ELSE NULL END AS "departmentLead",
            u.name AS lead_name,
            u.surname AS lead_surname,
            u.email AS lead_email
     FROM department d
     LEFT JOIN users u ON d.lead_id::text = u.user_id::text
     WHERE d.department_id = $1`,
    [id]
  );
  return result.rows[0];
};

export const updateDepartment = async (
  id: number,
  name?: string | null,
  description?: string | null,
  status?: string | null,
  leadId?: string | null
) => {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (name !== undefined) {
    fields.push(`department_name = $${paramIndex++}`);
    values.push(name);
  }
  if (description !== undefined) {
    fields.push(`description = $${paramIndex++}`);
    values.push(description);
  }
  if (status !== undefined) {
    fields.push(`status = $${paramIndex++}`);
    values.push(status);
  }
  if (leadId !== undefined) {
    fields.push(`lead_id = $${paramIndex++}`);
    values.push(leadId);
  }

  if (fields.length === 0) {
    return getDepartmentById(id);
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const result = await pool.query(
    `UPDATE department
     SET ${fields.join(", ")}
     WHERE department_id = $${paramIndex}
     RETURNING *`,
    values
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
