import { Request, Response } from "express";
import * as categoryService from "../services/categoryService";
import * as departmentService from "../services/departmentService";
import { canManageDepartment } from "./departmentController";

const STATUSES = ["active", "inactive"];

const isId = (value: unknown) =>
  value !== undefined && value !== null && /^\d+$/.test(String(value));

const isNonEmptyText = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isMissing = (value: unknown) => value === undefined || value === null;

const toNullIfBlank = (value: unknown) =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : null;

const collectErrors = (rules: [boolean, string][]): string[] =>
  rules.filter(([failed]) => failed).map(([, message]) => message);

type LoadResult = { category?: any; error?: { status: number; message: string } };

const loadCategoryForUser = async (
  user: any,
  idParam: string,
  action: string
): Promise<LoadResult> => {
  if (!/^\d+$/.test(idParam)) {
    return { error: { status: 400, message: "Invalid category ID." } };
  }

  const category = await categoryService.getCategoryById(Number(idParam));
  if (!category) {
    return { error: { status: 404, message: "Category not found." } };
  }

  const department = category.category_department_id
    ? await departmentService.getDepartmentById(category.category_department_id)
    : null;

  const allowed = department
    ? canManageDepartment(user, department)
    : user?.role === "System Admin";

  if (!allowed) {
    return {
      error: {
        status: 403,
        message: department
          ? `You can only ${action} categories in a department you lead.`
          : `Only a System Admin can ${action} a category that has no department.`,
      },
    };
  }

  return { category };
};

const validateCategoryInput = (body: any): string[] => {
  const { department_id, name, description, status } = body;

  return collectErrors([
    [!isId(department_id), "A valid department_id is required."],
    [!isNonEmptyText(name), "Category name is required."],
    [isNonEmptyText(name) && name.trim().length > 100, "Category name must be 100 characters or fewer."],
    [!isMissing(description) && typeof description !== "string", "Description must be text."],
    [typeof description === "string" && description.trim().length > 500, "Description must be 500 characters or fewer."],
    [status !== undefined && !STATUSES.includes(status), "Status must be 'active' or 'inactive'."],
  ]);
};

const validateCategoryQuery = (query: any): string[] => {
  const { department_id, status } = query;

  return collectErrors([
    [!isId(department_id), "A valid department_id query parameter is required."],
    [status !== undefined && !STATUSES.includes(status), "Status must be 'active' or 'inactive'."],
  ]);
};

const validateCategoryUpdate = (body: any): string[] => {
  const { name, description, status } = body;

  return collectErrors([
    [name === undefined && description === undefined && status === undefined, "Provide at least one field to update."],
    [name !== undefined && !isNonEmptyText(name), "Category name cannot be empty."],
    [isNonEmptyText(name) && name.trim().length > 100, "Category name must be 100 characters or fewer."],
    [!isMissing(description) && typeof description !== "string", "Description must be text."],
    [typeof description === "string" && description.trim().length > 500, "Description must be 500 characters or fewer."],
    [status !== undefined && !STATUSES.includes(status), "Status must be 'active' or 'inactive'."],
  ]);
};

export const createCategory = async (req: Request, res: Response) => {
  const body = req.body ?? {};

  const errors = validateCategoryInput(body);
  if (errors.length > 0) {
    return res.status(400).json({ message: "Validation failed", errors });
  }

  const { department_id, name, description, status } = body;

  try {
    const department = await departmentService.getDepartmentById(Number(department_id));
    if (!department) {
      return res.status(404).json({ message: "Department not found." });
    }

    if (!canManageDepartment(req.user, department)) {
      return res
        .status(403)
        .json({ message: "You can only create categories for a department you lead." });
    }

    const category = await categoryService.createCategory(
      Number(department_id),
      name.trim(),
      toNullIfBlank(description),
      status || "active"
    );
    return res.status(201).json({ category });
  } catch (error: any) {
    if (error.code === "23505") {
      return res
        .status(409)
        .json({ message: "A category with that name already exists in this department." });
    }
    console.error("Category error:", error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  // const errors = validateCategoryQuery(req.query);
  // if (errors.length > 0) {
  //   return res.status(400).json({ message: "Validation failed", errors });
  // }

  const status = (req.query.status as string) || null;

  try {
    // if (!canViewAllCategories(req.user)) {
    //   return res
    //     .status(403)
    //     .json({ message: "You don't have permission to view all categories." });
    // }

    const categories = await categoryService.getAllCategories(status);
    return res.status(200).json({ categories });
  } catch (error) {
    console.error("Category error:", error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

export const getCategory = async (req: Request, res: Response) => {
  try {
    const { category, error } = await loadCategoryForUser(req.user, req.params.id as string, "view");
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }
    return res.status(200).json({ category });
  } catch (error) {
    console.error("Category error:", error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  const body = req.body ?? {};

  const errors = validateCategoryUpdate(body);
  if (errors.length > 0) {
    return res.status(400).json({ message: "Validation failed", errors });
  }

  const { name, description, status } = body;

  try {
    const { error } = await loadCategoryForUser(req.user, req.params.id as string, "update");
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    const category = await categoryService.updateCategory(
      Number(req.params.id),
      name !== undefined ? name.trim() : null,
      typeof description === "string" ? description.trim() : null,
      status ?? null
    );
    return res.status(200).json({ category });
  } catch (error: any) {
    if (error.code === "23505") {
      return res
        .status(409)
        .json({ message: "A category with that name already exists in this department." });
    }
    console.error("Category error:", error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  const usedMessage = "This category is used by existing tickets. Deactivate it instead.";

  try {
    const { error } = await loadCategoryForUser(req.user, req.params.id as string, "delete");
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    const categoryId = Number(req.params.id);

    if (await categoryService.categoryIsUsed(categoryId)) {
      return res.status(409).json({ message: usedMessage });
    }

    const category = await categoryService.deleteCategory(categoryId);
    return res.status(200).json({ message: "Category deleted.", category });
  } catch (error: any) {
    if (error.code === "23503") {
      return res.status(409).json({ message: usedMessage });
    }
    console.error("Category error:", error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};