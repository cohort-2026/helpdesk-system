import { pool } from "../config/database";

export interface CategoryField {
  id: string;
  label: string;
  type: "text" | "number" | "longtext" | "date";
  required: boolean;
}

export interface CategoryInput {
  departmentId: number;
  name: string;
  description: string | null;
  status: string;
  defaultPriority: string;
  needsApproval: boolean;
  extraFields: CategoryField[];
}

export interface CategoryUpdate {
  departmentId?: number;
  name?: string;
  description?: string | null;
  status?: string;
  defaultPriority?: string;
  needsApproval?: boolean;
  extraFields?: CategoryField[];
}

const CATEGORY_WITH_DEPARTMENT = `
  SELECT c.*, d.department_name
  FROM category c
  LEFT JOIN department d ON d.department_id = c.category_department_id
`;

export const createCategory = async (input: CategoryInput) => {
  const result = await pool.query(
    `INSERT INTO category (
       category_department_id, category_name, description, status,
       default_priority, needs_approval, extra_fields
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
     RETURNING category_id`,
    [
      input.departmentId,
      input.name,
      input.description,
      input.status,
      input.defaultPriority,
      input.needsApproval,
      JSON.stringify(input.extraFields),
    ]
  );
  return getCategoryById(result.rows[0].category_id);
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

export const updateCategory = async (id: number, updates: CategoryUpdate) => {
  const columns: Record<keyof CategoryUpdate, string> = {
    departmentId: "category_department_id",
    name: "category_name",
    description: "description",
    status: "status",
    defaultPriority: "default_priority",
    needsApproval: "needs_approval",
    extraFields: "extra_fields",
  };
  const fields: string[] = [];
  const values: unknown[] = [];

  for (const key of Object.keys(columns) as (keyof CategoryUpdate)[]) {
    const value = updates[key];
    if (value === undefined) continue;

    values.push(key === "extraFields" ? JSON.stringify(value) : value);
    const cast = key === "extraFields" ? "::jsonb" : "";
    fields.push(`${columns[key]} = $${values.length}${cast}`);
  }

  if (fields.length === 0) return getCategoryById(id);

  values.push(id);
  await pool.query(
    `UPDATE category
     SET ${fields.join(", ")}, updated_at = NOW()
     WHERE category_id = $${values.length}`,
    values
  );
  return getCategoryById(id);
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
