import { Request, Response } from "express";
import { randomUUID } from "crypto";
import * as categoryService from "../services/categoryService";
import * as departmentService from "../services/departmentService";
import { canManageDepartment } from "./departmentController";

const STATUSES = ["active", "inactive"];
const PRIORITIES = ["low", "normal", "high", "urgent"];
const FIELD_TYPES = ["text", "number", "longtext", "date"];

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
  const {
    department_id,
    name,
    description,
    status,
    default_priority,
    needs_approval,
    extra_fields,
  } = body;

  return collectErrors([
    [!isId(department_id), "A valid department_id is required."],
    [!isNonEmptyText(name), "Category name is required."],
    [isNonEmptyText(name) && name.trim().length > 255, "Category name must be 255 characters or fewer."],
    [!isMissing(description) && typeof description !== "string", "Description must be text."],
    [typeof description === "string" && description.trim().length > 500, "Description must be 500 characters or fewer."],
    [status !== undefined && !STATUSES.includes(status), "Status must be 'active' or 'inactive'."],
    [default_priority !== undefined && !PRIORITIES.includes(default_priority), "Default priority must be low, normal, high, or urgent."],
    [needs_approval !== undefined && typeof needs_approval !== "boolean", "needs_approval must be a boolean."],
    [extra_fields !== undefined && !isValidExtraFields(extra_fields), "extra_fields must be an array of valid field definitions."],
  ]);
};

const validateCategoryQuery = (query: any): string[] => {
  const { department_id, status } = query;

  return collectErrors([
    [department_id !== undefined && !isId(department_id), "department_id must be a valid department ID."],
    [status !== undefined && !STATUSES.includes(status), "Status must be 'active' or 'inactive'."],
  ]);
};

const validateCategoryUpdate = (body: any): string[] => {
  const {
    department_id,
    name,
    description,
    status,
    default_priority,
    needs_approval,
    extra_fields,
  } = body;

  return collectErrors([
    [
      department_id === undefined &&
        name === undefined &&
        description === undefined &&
        status === undefined &&
        default_priority === undefined &&
        needs_approval === undefined &&
        extra_fields === undefined,
      "Provide at least one field to update.",
    ],
    [department_id !== undefined && !isId(department_id), "A valid department_id is required."],
    [name !== undefined && !isNonEmptyText(name), "Category name cannot be empty."],
    [isNonEmptyText(name) && name.trim().length > 255, "Category name must be 255 characters or fewer."],
    [!isMissing(description) && typeof description !== "string", "Description must be text."],
    [typeof description === "string" && description.trim().length > 500, "Description must be 500 characters or fewer."],
    [status !== undefined && !STATUSES.includes(status), "Status must be 'active' or 'inactive'."],
    [default_priority !== undefined && !PRIORITIES.includes(default_priority), "Default priority must be low, normal, high, or urgent."],
    [needs_approval !== undefined && typeof needs_approval !== "boolean", "needs_approval must be a boolean."],
    [extra_fields !== undefined && !isValidExtraFields(extra_fields), "extra_fields must be an array of valid field definitions."],
  ]);
};

const isValidExtraFields = (value: unknown): boolean =>
  Array.isArray(value) &&
  value.length <= 50 &&
  value.every(
    (field) =>
      field !== null &&
      typeof field === "object" &&
      typeof field.label === "string" &&
      field.label.trim().length > 0 &&
      field.label.trim().length <= 120 &&
      FIELD_TYPES.includes(field.type) &&
      (field.id === undefined || (typeof field.id === "string" && field.id.length <= 100)) &&
      (field.required === undefined || typeof field.required === "boolean")
  );

const normalizeExtraFields = (fields: any[] = []) =>
  fields.map((field) => ({
    id: field.id || randomUUID(),
    label: field.label.trim(),
    type: field.type,
    required: field.required ?? true,
  }));

export const createCategory = async (req: Request, res: Response) => {
  const body = req.body ?? {};

  const errors = validateCategoryInput(body);
  if (errors.length > 0) {
    return res.status(400).json({ message: "Validation failed", errors });
  }

  const {
    department_id,
    name,
    description,
    status,
    default_priority,
    needs_approval,
    extra_fields,
  } = body;

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
      {
        departmentId: Number(department_id),
        name: name.trim(),
        description: toNullIfBlank(description),
        status: status || "active",
        defaultPriority: default_priority || "normal",
        needsApproval: needs_approval ?? false,
        extraFields: normalizeExtraFields(extra_fields),
      }
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
  const errors = validateCategoryQuery(req.query);
  if (errors.length > 0) {
    return res.status(400).json({ message: "Validation failed", errors });
  }

  const status = (req.query.status as string) || null;
  const departmentId = req.query.department_id === undefined
    ? null
    : Number(req.query.department_id);

  try {
    const categories = departmentId === null
      ? await categoryService.getAllCategories(status)
      : await categoryService.getCategoriesByDepartment(departmentId, status);
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

  const {
    department_id,
    name,
    description,
    status,
    default_priority,
    needs_approval,
    extra_fields,
  } = body;

  try {
    const { category: existingCategory, error } = await loadCategoryForUser(
      req.user,
      req.params.id as string,
      "update"
    );
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    if (department_id !== undefined) {
      const targetDepartment = await departmentService.getDepartmentById(Number(department_id));
      if (!targetDepartment) {
        return res.status(404).json({ message: "Department not found." });
      }
      if (!canManageDepartment(req.user, targetDepartment)) {
        return res
          .status(403)
          .json({ message: "You can only move categories to a department you lead." });
      }
    }

    const updates: categoryService.CategoryUpdate = {};
    if (department_id !== undefined) updates.departmentId = Number(department_id);
    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = toNullIfBlank(description);
    if (status !== undefined) updates.status = status;
    if (default_priority !== undefined) updates.defaultPriority = default_priority;
    if (needs_approval !== undefined) updates.needsApproval = needs_approval;
    if (extra_fields !== undefined) updates.extraFields = normalizeExtraFields(extra_fields);

    const category = await categoryService.updateCategory(
      existingCategory!.category_id,
      updates
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