import { Request, Response } from "express";
import * as departmentService from "../services/departmentService";

const STATUSES = ["active", "inactive"];

const handleError = (res: Response, error: any) => {
  if (error.code === "23505") {
    return res.status(409).json({ message: "A department with that name already exists." });
  }
  if (error.code === "23503") {
    return res.status(400).json({ message: "The selected lead does not exist." });
  }
  console.error("Department error:", error);
  return res.status(500).json({ message: "Something went wrong." });
};

export const create = async (req: Request, res: Response) => {
  const { name, description, status, leadId } = req.body;
  const errors: string[] = [];

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    errors.push("Department name is required.");

  } else if (name.trim().length > 255) {
    errors.push("Department name must be 255 characters or fewer.");
  }

  if (status !== undefined && !STATUSES.includes(status)) {
    errors.push("Status must be 'active' or 'inactive'.");
  }

  if (leadId !== undefined && leadId !== null && !/^\d+$/.test(String(leadId))) {
    errors.push("Lead ID must be a valid user ID.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: "Validation failed", errors });
  }

  try {
    const department = await departmentService.createDepartment(
      name.trim(),
      description ? String(description).trim() : null,
      status || "active",
      leadId !== undefined && leadId !== null ? String(leadId) : null
    );
    return res.status(201).json({ department });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getAll = async (req: Request, res: Response) => {
  const page = Math.max(parseInt(req.query.page as string) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 10, 1), 100);
  const status = (req.query.status as string) || null;
  const search = (req.query.search as string)?.trim() || null;

  if (status && !STATUSES.includes(status)) {
    return res.status(400).json({ message: "Status must be 'active' or 'inactive'." });
  }

  try {
    const { departments, total } = await departmentService.getDepartments(page, limit, status, search);
    return res.status(200).json({
      departments,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getOne = async (req: Request, res: Response) => { //FInd by id 
  const idParam = req.params.id as string;

  if (!/^\d+$/.test(idParam)) {
    return res.status(400).json({ message: "Invalid department ID." });
  }

  try {
    const department = await departmentService.getDepartmentById(Number(idParam));
    if (!department) {
      return res.status(404).json({ message: "Department not found." });
    }
    return res.status(200).json({ department });
  } catch (error) {
    return handleError(res, error);
  }
};