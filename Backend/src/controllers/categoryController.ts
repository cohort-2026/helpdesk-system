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

const validateCategoryInput = (body: any): string[] => {
  const { department_id, name, description, status } = body;

  const rules: [boolean, string][] = [
    [!isId(department_id), "A valid department_id is required."],
    [!isNonEmptyText(name), "Category name is required."],
    [isNonEmptyText(name) && name.trim().length > 100, "Category name must be 100 characters or fewer."],
    [!isMissing(description) && typeof description !== "string", "Description must be text."],
    [typeof description === "string" && description.trim().length > 500, "Description must be 500 characters or fewer."],
    [status !== undefined && !STATUSES.includes(status), "Status must be 'active' or 'inactive'."],
  ];

  return rules.filter(([failed]) => failed).map(([, message]) => message);
};

export const createCategory = async (req: Request, res: Response) => {
  const errors = validateCategoryInput(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ message: "Validation failed", errors });
  }

  const { department_id, name, description, status } = req.body;

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
