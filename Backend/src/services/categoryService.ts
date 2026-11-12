import { pool } from "../config/database";
import { Category, CreateCategoryDto, UpdateCategoryDto } from "../types/category.types";

export const createCategory = async (dto: CreateCategoryDto): Promise<Category> => {
  const { category_name, category_department_id, status = "active" } = dto;
  const result = await pool.query(
    `INSERT INTO category (category_name, category_department_id, status)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [category_name.trim(), category_department_id, status]
  );
  return result.rows[0];
};

export const getCategories = async (options: {
  page?: number;
  limit?: number;
  department_id?: number | null;
  status?: string | null;
  search?: string | null;
}) => {
  const { page = 1, limit = 10, department_id = null, status = null, search = null } = options;

  const whereClauses: string[] = [];
  const params: any[] = [];
  let paramIdx = 1;

  if (department_id !== null && department_id !== undefined) {
    whereClauses.push(`c.category_department_id = $${paramIdx++}`);
    params.push(department_id);
  }

  if (status !== null && status !== undefined) {
    whereClauses.push(`c.status = $${paramIdx++}`);
    params.push(status);
  }

  if (search !== null && search !== undefined && search.trim() !== "") {
    whereClauses.push(`c.category_name ILIKE $${paramIdx++}`);
    params.push(`%${search.trim()}%`);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  const offset = (page - 1) * limit;

  const dataQuery = `
    SELECT c.*, d.department_name
    FROM category c
    LEFT JOIN department d ON c.category_department_id = d.department_id
    ${whereSql}
    ORDER BY c.category_name ASC
    LIMIT $${paramIdx++} OFFSET $${paramIdx++}
  `;
  const countQuery = `
    SELECT COUNT(*)::int AS total
    FROM category c
    ${whereSql}
  `;

  const [dataResult, countResult] = await Promise.all([
    pool.query(dataQuery, [...params, limit, offset]),
    pool.query(countQuery, params)
  ]);

  return {
    categories: dataResult.rows as Category[],
    total: countResult.rows[0].total as number
  };
};

export const getCategoryById = async (id: number): Promise<Category | null> => {
  const result = await pool.query(
    `SELECT c.*, d.department_name
     FROM category c
     LEFT JOIN department d ON c.category_department_id = d.department_id
     WHERE c.category_id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

export const getActiveCategoriesByDepartment = async (departmentId: number): Promise<Category[]> => {
  const result = await pool.query(
    `SELECT c.*, d.department_name
     FROM category c
     LEFT JOIN department d ON c.category_department_id = d.department_id
     WHERE c.category_department_id = $1 AND c.status = 'active'
     ORDER BY c.category_name ASC`,
    [departmentId]
  );
  return result.rows;
};

export const updateCategory = async (
  id: number,
  dto: UpdateCategoryDto
): Promise<Category | null> => {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (dto.category_name !== undefined) {
    fields.push(`category_name = $${paramIndex++}`);
    values.push(dto.category_name.trim());
  }

  if (dto.category_department_id !== undefined) {
    fields.push(`category_department_id = $${paramIndex++}`);
    values.push(dto.category_department_id);
  }

  if (dto.status !== undefined) {
    fields.push(`status = $${paramIndex++}`);
    values.push(dto.status);
  }

  if (fields.length === 0) {
    return getCategoryById(id);
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const result = await pool.query(
    `UPDATE category
     SET ${fields.join(", ")}
     WHERE category_id = $${paramIndex}
     RETURNING *`,
    values
  );

  return result.rows[0] || null;
};

export const softDeleteCategory = async (id: number): Promise<Category | null> => {
  const result = await pool.query(
    `UPDATE category
     SET status = 'inactive', updated_at = NOW()
     WHERE category_id = $1
     RETURNING *`,
    [id]
  );
  return result.rows[0] || null;
};

