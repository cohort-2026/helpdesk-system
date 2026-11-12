import { Request, Response } from "express";
import * as categoryService from "../services/categoryService";

const STATUSES = ["active", "inactive"];

const handleError = (res: Response, error: any) => {
  if (error.code === "23505") {
    return res.status(409).json({ message: "A category with that name already exists in this department." });
  }
  if (error.code === "23503") {
    return res.status(400).json({ message: "The specified department does not exist." });
  }
  console.error("Category error:", error);
  return res.status(500).json({ message: error.message || "Internal server error", detail: error.code });
};

export const create = async (req: Request, res: Response) => {
  const { category_name, category_department_id, status } = req.body;
  const errors: string[] = [];

  if (!category_name || typeof category_name !== "string" || category_name.trim().length === 0) {
    errors.push("Category name is required.");
  } else if (category_name.trim().length > 255) {
    errors.push("Category name must be 255 characters or fewer.");
  }

  // if (category_department_id === undefined || category_department_id === null || !/^\d+$/.test(String(category_department_id))) {
  //   errors.push("Valid category department ID is required.");
  // }

  if (status !== undefined && !STATUSES.includes(status)) {
    errors.push("Status must be 'active' or 'inactive'.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: "Validation failed", errors });
  }

  try {
    const category = await categoryService.createCategory({
      category_name: category_name.trim(),
      // category_department_id: Number(category_department_id),
      status: status || "active",
    });
    return res.status(201).json({ category });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getAll = async (req: Request, res: Response) => {
  const page = Math.max(parseInt(req.query.page as string) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 10, 1), 100);
  const status = (req.query.status as string) || null;
  const search = (req.query.search as string)?.trim() || null;
  const departmentIdParam = req.query.department_id as string | undefined;

  let department_id: number | null = null;
  if (departmentIdParam !== undefined && departmentIdParam !== null && departmentIdParam !== "") {
    if (!/^\d+$/.test(departmentIdParam)) {
      return res.status(400).json({ message: "Invalid department_id query parameter." });
    }
    department_id = Number(departmentIdParam);
  }

  if (status && !STATUSES.includes(status)) {
    return res.status(400).json({ message: "Status must be 'active' or 'inactive'." });
  }

  try {
    const { categories, total } = await categoryService.getCategories({
      page,
      limit,
      department_id,
      status,
      search,
    });
    return res.status(200).json({
      categories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getOne = async (req: Request, res: Response) => {
  const idParam = req.params.id as string;

  if (!/^\d+$/.test(idParam)) {
    return res.status(400).json({ message: "Invalid category ID." });
  }

  try {
    const category = await categoryService.getCategoryById(Number(idParam));
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }
    return res.status(200).json({ category });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getByDepartment = async (req: Request, res: Response) => {
  const departmentIdParam = req.params.departmentId as string;

  if (!/^\d+$/.test(departmentIdParam)) {
    return res.status(400).json({ message: "Invalid department ID." });
  }

  try {
    const categories = await categoryService.getActiveCategoriesByDepartment(Number(departmentIdParam));
    return res.status(200).json({ categories });
  } catch (error) {
    return handleError(res, error);
  }
};

export const update = async (req: Request, res: Response) => {
  const idParam = req.params.id as string;

  if (!/^\d+$/.test(idParam)) {
    return res.status(400).json({ message: "Invalid category ID." });
  }

  const { category_name, category_department_id, status } = req.body;
  const errors: string[] = [];

  if (category_name !== undefined) {
    if (typeof category_name !== "string" || category_name.trim().length === 0) {
      errors.push("Category name cannot be empty.");
    } else if (category_name.trim().length > 255) {
      errors.push("Category name must be 255 characters or fewer.");
    }
  }

  if (category_department_id !== undefined) {
    if (category_department_id === null || !/^\d+$/.test(String(category_department_id))) {
      errors.push("Valid category department ID is required.");
    }
  }

  if (status !== undefined && !STATUSES.includes(status)) {
    errors.push("Status must be 'active' or 'inactive'.");
  }

  if (category_name === undefined && category_department_id === undefined && status === undefined) {
    errors.push("Provide a category_name, category_department_id, or status to update.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: "Validation failed", errors });
  }

  try {
    const category = await categoryService.updateCategory(Number(idParam), {
      category_name: category_name !== undefined ? category_name.trim() : undefined,
      category_department_id: category_department_id !== undefined ? Number(category_department_id) : undefined,
      status: status !== undefined ? status : undefined,
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }
    return res.status(200).json({ category });
  } catch (error) {
    return handleError(res, error);
  }
};

export const remove = async (req: Request, res: Response) => {
  const idParam = req.params.id as string;

  if (!/^\d+$/.test(idParam)) {
    return res.status(400).json({ message: "Invalid category ID." });
  }

  try {
    const category = await categoryService.softDeleteCategory(Number(idParam));
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }
    return res.status(200).json({ message: "Category deactivated.", category });
  } catch (error) {
    return handleError(res, error);
  }
};

