import { Request, Response } from "express";
import * as ticketService from "../services/ticketService";
import {
  TicketPriority,
  TicketStatus,
  VALID_PRIORITIES,
  VALID_STATUSES,
  CreateTicketDto,
  UpdateTicketDto,
  TicketFilters
} from "../types/ticket.types";

// Helper for normalizing status strings case-insensitively
const normalizeStatus = (val?: string): TicketStatus | null => {
  if (!val) return null;
  const match = VALID_STATUSES.find(s => s.toLowerCase() === val.trim().toLowerCase());
  return match || null;
};

// Helper for normalizing priority strings case-insensitively
const normalizePriority = (val?: string): TicketPriority | null => {
  if (!val) return null;
  const match = VALID_PRIORITIES.find(p => p.toLowerCase() === val.trim().toLowerCase());
  return match || null;
};

const handleError = (res: Response, error: any) => {
  console.error("Ticket error:", error);
  if (error.code === "23503") {
    return res.status(400).json({ message: "Referenced entity (department, category, or user) does not exist." });
  }
  return res.status(500).json({ message: "An unexpected error occurred", error: error.message });
};


export const createTicket = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const {
    title,
    description,
    priority,
    status,
    department_id,
    ticket_department_id,
    category_id,
    ticket_category_id,
    request_type_id,
    ticket_request_type_id,
    assignee_id,
    requester_id
  } = req.body;

  const errors: string[] = [];

  // Title validation
  if (!title || typeof title !== "string" || title.trim().length === 0) {
    errors.push("Title is required.");
  } else if (title.trim().length > 255) {
    errors.push("Title must be 255 characters or fewer.");
  }

  // Description validation
  if (description !== undefined && description !== null && typeof description !== "string") {
    errors.push("Description must be a string.");
  }

  // Priority validation
  let validatedPriority: TicketPriority = "Low";
  if (priority !== undefined && priority !== null) {
    const norm = normalizePriority(String(priority));
    if (!norm) {
      errors.push(`Priority must be one of: ${VALID_PRIORITIES.join(", ")}.`);
    } else {
      validatedPriority = norm;
    }
  }

  // Status validation (default 'Open')
  let validatedStatus: TicketStatus = "Open";
  if (status !== undefined && status !== null) {
    const norm = normalizeStatus(String(status));
    if (!norm) {
      errors.push(`Status must be one of: ${VALID_STATUSES.join(", ")}.`);
    } else {
      validatedStatus = norm;
    }
  }

  // Department ID validation
  const targetDeptId = department_id !== undefined ? department_id : ticket_department_id;
  let parsedDeptId: number | null = null;
  if (targetDeptId !== undefined && targetDeptId !== null && String(targetDeptId).trim() !== "") {
    if (!/^\d+$/.test(String(targetDeptId))) {
      errors.push("Department ID must be a valid integer.");
    } else {
      parsedDeptId = Number(targetDeptId);
    }
  }

  // Category ID validation
  const targetCatId = category_id !== undefined ? category_id : ticket_category_id;
  let parsedCatId: number | null = null;
  if (targetCatId !== undefined && targetCatId !== null && String(targetCatId).trim() !== "") {
    if (!/^\d+$/.test(String(targetCatId))) {
      errors.push("Category ID must be a valid integer.");
    } else {
      parsedCatId = Number(targetCatId);
    }
  }

  // Request Type ID validation
  const targetReqTypeId = request_type_id !== undefined ? request_type_id : ticket_request_type_id;
  let parsedReqTypeId: number | null = null;
  if (targetReqTypeId !== undefined && targetReqTypeId !== null && String(targetReqTypeId).trim() !== "") {
    if (!/^\d+$/.test(String(targetReqTypeId))) {
      errors.push("Request type ID must be a valid integer.");
    } else {
      parsedReqTypeId = Number(targetReqTypeId);
    }
  }

  // Assignee ID validation
  let parsedAssigneeId: string | null = null;
  if (assignee_id !== undefined && assignee_id !== null && String(assignee_id).trim() !== "") {
    if (!/^\d+$/.test(String(assignee_id))) {
      errors.push("Assignee ID must be a valid user ID.");
    } else {
      parsedAssigneeId = String(assignee_id).trim();
    }
  }

  // Requester resolution: Employees can only create tickets as themselves
  let resolvedRequesterId = String(user.user_id);
  const isPrivileged = ["System Admin", "Platform Admin", "Agent", "Department Lead"].includes(user.role);
  if (isPrivileged && requester_id !== undefined && requester_id !== null && String(requester_id).trim() !== "") {
    if (!/^\d+$/.test(String(requester_id))) {
      errors.push("Requester ID must be a valid user ID.");
    } else {
      resolvedRequesterId = String(requester_id).trim();
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: "Validation failed", errors });
  }

  try {
    // Foreign key existence checks
    if (parsedDeptId !== null) {
      const deptExists = await ticketService.checkDepartmentExists(parsedDeptId);
      if (!deptExists) {
        return res.status(400).json({ message: "Department not found with the provided ID." });
      }
    }

    if (parsedCatId !== null) {
      const catExists = await ticketService.checkCategoryExists(parsedCatId);
      if (!catExists) {
        return res.status(400).json({ message: "Category not found with the provided ID." });
      }
    }

    if (parsedReqTypeId !== null) {
      const reqTypeExists = await ticketService.checkRequestTypeExists(parsedReqTypeId);
      if (!reqTypeExists) {
        return res.status(400).json({ message: "Request type not found with the provided ID." });
      }
    }

    if (parsedAssigneeId !== null) {
      const assigneeExists = await ticketService.checkUserExists(parsedAssigneeId);
      if (!assigneeExists) {
        return res.status(400).json({ message: "Assignee user not found." });
      }
    }

    if (resolvedRequesterId !== String(user.user_id)) {
      const requesterExists = await ticketService.checkUserExists(resolvedRequesterId);
      if (!requesterExists) {
        return res.status(400).json({ message: "Requester user not found." });
      }
    }

    const newTicketDto: CreateTicketDto = {
      title: title.trim(),
      description: description ? description.trim() : null,
      priority: validatedPriority,
      status: validatedStatus,
      department_id: parsedDeptId,
      category_id: parsedCatId,
      request_type_id: parsedReqTypeId,
      requester_id: resolvedRequesterId,
      assignee_id: parsedAssigneeId
    };

    const ticket = await ticketService.createTicket(newTicketDto);
    return res.status(201).json({ message: "Ticket created successfully", ticket });
  } catch (error) {
    return handleError(res, error);
  }
};


export const fetchTickets = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit as string, 10) || 10, 1), 100);
  const statusParam = req.query.status as string;
  const priorityParam = req.query.priority as string;
  const deptParam = (req.query.department_id || req.query.department) as string;
  const creatorParam = (req.query.creator_id || req.query.requester_id || req.query.creator) as string;
  const assigneeParam = (req.query.assignee_id || req.query.assignee) as string;
  const searchParam = req.query.search as string;
  const includeDeletedParam = req.query.include_deleted === "true";

  // Validate status filter if given
  let normalizedStatus: string | null = null;
  if (statusParam) {
    const norm = normalizeStatus(statusParam);
    if (!norm) {
      return res.status(400).json({
        message: `Invalid status filter. Allowed values: ${VALID_STATUSES.join(", ")}.`
      });
    }
    normalizedStatus = norm;
  }

  // Validate priority filter if given
  let normalizedPriority: string | null = null;
  if (priorityParam) {
    const norm = normalizePriority(priorityParam);
    if (!norm) {
      return res.status(400).json({
        message: `Invalid priority filter. Allowed values: ${VALID_PRIORITIES.join(", ")}.`
      });
    }
    normalizedPriority = norm;
  }

  // Validate department_id filter if given
  let parsedDeptId: number | null = null;
  if (deptParam !== undefined && deptParam !== null && deptParam.trim() !== "") {
    if (!/^\d+$/.test(deptParam.trim())) {
      return res.status(400).json({ message: "department_id must be a valid integer." });
    }
    parsedDeptId = Number(deptParam.trim());
  }

  // Allow include_deleted only for System Admin and Platform Admin
  const canSeeDeleted = ["System Admin", "Platform Admin"].includes(user.role);
  const include_deleted = canSeeDeleted && includeDeletedParam;

  const filters: TicketFilters = {
    page,
    limit,
    status: normalizedStatus,
    priority: normalizedPriority,
    department_id: parsedDeptId,
    creator_id: creatorParam?.trim() || null,
    assignee_id: assigneeParam?.trim() || null,
    search: searchParam?.trim() || null,
    include_deleted
  };

  try {
    const { tickets, total } = await ticketService.getTickets(filters, user.role, String(user.user_id));
    return res.status(200).json({
      tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return handleError(res, error);
  }
};


export const getTicketById = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const idParam = req.params.id;
  if (!/^\d+$/.test(idParam)) {
    return res.status(400).json({ message: "Invalid ticket ID. Must be an integer." });
  }

  const ticketId = Number(idParam);

  try {
    const canSeeDeleted = ["System Admin", "Platform Admin"].includes(user.role);
    const ticket = await ticketService.getTicketById(ticketId, user.role, canSeeDeleted);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found." });
    }

    // Role-based access control:
    // Regular employees can ONLY view their own tickets
    if (user.role === "Employee" && String(ticket.requester_id) !== String(user.user_id)) {
      return res.status(403).json({ message: "Forbidden: You are not authorized to view this ticket." });
    }

    return res.status(200).json({ ticket });
  } catch (error) {
    return handleError(res, error);
  }
};


export const updateTicket = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  // Support /:id parameter, or id in body for legacy /update endpoint
  const idParam = req.params.id || req.body.ticket_id || req.body.id;
  if (!idParam || !/^\d+$/.test(String(idParam))) {
    return res.status(400).json({ message: "Invalid or missing ticket ID." });
  }

  const ticketId = Number(idParam);

  try {
    // Check if ticket exists
    const existingTicket = await ticketService.getTicketById(ticketId, user.role, false);
    if (!existingTicket) {
      return res.status(404).json({ message: "Ticket not found." });
    }

    const isStaffOrAdmin = ["System Admin", "Platform Admin", "Agent", "Department Lead"].includes(user.role);
    const isOwner = String(existingTicket.requester_id) === String(user.user_id);

    // If neither staff/admin nor ticket owner, forbidden
    if (!isStaffOrAdmin && !isOwner) {
      return res.status(403).json({ message: "Forbidden: You are not authorized to update this ticket." });
    }

    const {
      title,
      description,
      priority,
      status,
      department_id,
      ticket_department_id,
      category_id,
      ticket_category_id,
      request_type_id,
      ticket_request_type_id,
      assignee_id
    } = req.body;

    const errors: string[] = [];
    const updateData: UpdateTicketDto = {};

    // Check Employee restrictions:
    // Employees can only update title, description, or cancel their ticket
    if (user.role === "Employee") {
      if (priority !== undefined || assignee_id !== undefined || department_id !== undefined || category_id !== undefined || request_type_id !== undefined) {
        return res.status(403).json({
          message: "Forbidden: Employees can only edit title, description, or cancel their own tickets."
        });
      }
      if (status !== undefined) {
        const norm = normalizeStatus(String(status));
        if (norm !== "Cancelled") {
          return res.status(403).json({
            message: "Forbidden: Employees can only change ticket status to 'Cancelled'."
          });
        }
      }
    }

    // Validate title
    if (title !== undefined) {
      if (typeof title !== "string" || title.trim().length === 0) {
        errors.push("Title cannot be empty.");
      } else if (title.trim().length > 255) {
        errors.push("Title must be 255 characters or fewer.");
      } else {
        updateData.title = title.trim();
      }
    }

    // Validate description
    if (description !== undefined) {
      if (description !== null && typeof description !== "string") {
        errors.push("Description must be a string.");
      } else {
        updateData.description = description ? description.trim() : null;
      }
    }

    // Validate priority
    if (priority !== undefined && priority !== null) {
      const norm = normalizePriority(String(priority));
      if (!norm) {
        errors.push(`Priority must be one of: ${VALID_PRIORITIES.join(", ")}.`);
      } else {
        updateData.priority = norm;
      }
    }

    // Validate status
    if (status !== undefined && status !== null) {
      const norm = normalizeStatus(String(status));
      if (!norm) {
        errors.push(`Status must be one of: ${VALID_STATUSES.join(", ")}.`);
      } else {
        updateData.status = norm;
      }
    }

    // Validate department_id
    const targetDeptId = department_id !== undefined ? department_id : ticket_department_id;
    if (targetDeptId !== undefined) {
      if (targetDeptId === null || String(targetDeptId).trim() === "") {
        updateData.department_id = null;
      } else if (!/^\d+$/.test(String(targetDeptId))) {
        errors.push("Department ID must be a valid integer.");
      } else {
        const deptIdNum = Number(targetDeptId);
        const exists = await ticketService.checkDepartmentExists(deptIdNum);
        if (!exists) {
          errors.push("Department does not exist.");
        } else {
          updateData.department_id = deptIdNum;
        }
      }
    }

    // Validate category_id
    const targetCatId = category_id !== undefined ? category_id : ticket_category_id;
    if (targetCatId !== undefined) {
      if (targetCatId === null || String(targetCatId).trim() === "") {
        updateData.category_id = null;
      } else if (!/^\d+$/.test(String(targetCatId))) {
        errors.push("Category ID must be a valid integer.");
      } else {
        const catIdNum = Number(targetCatId);
        const exists = await ticketService.checkCategoryExists(catIdNum);
        if (!exists) {
          errors.push("Category does not exist.");
        } else {
          updateData.category_id = catIdNum;
        }
      }
    }

    // Validate request_type_id
    const targetReqTypeId = request_type_id !== undefined ? request_type_id : ticket_request_type_id;
    if (targetReqTypeId !== undefined) {
      if (targetReqTypeId === null || String(targetReqTypeId).trim() === "") {
        updateData.request_type_id = null;
      } else if (!/^\d+$/.test(String(targetReqTypeId))) {
        errors.push("Request type ID must be a valid integer.");
      } else {
        const reqTypeIdNum = Number(targetReqTypeId);
        const exists = await ticketService.checkRequestTypeExists(reqTypeIdNum);
        if (!exists) {
          errors.push("Request type does not exist.");
        } else {
          updateData.request_type_id = reqTypeIdNum;
        }
      }
    }

    // Validate assignee_id
    if (assignee_id !== undefined) {
      if (assignee_id === null || String(assignee_id).trim() === "") {
        updateData.assignee_id = null;
      } else if (!/^\d+$/.test(String(assignee_id))) {
        errors.push("Assignee ID must be a valid user ID.");
      } else {
        const exists = await ticketService.checkUserExists(String(assignee_id).trim());
        if (!exists) {
          errors.push("Assignee user does not exist.");
        } else {
          updateData.assignee_id = String(assignee_id).trim();
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    const updatedTicket = await ticketService.updateTicket(ticketId, updateData);
    return res.status(200).json({ message: "Ticket updated successfully", ticket: updatedTicket });
  } catch (error) {
    return handleError(res, error);
  }
};

export const deleteTicket = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const idParam = req.params.id || req.body.ticket_id || req.body.id;
  if (!idParam || !/^\d+$/.test(String(idParam))) {
    return res.status(400).json({ message: "Invalid or missing ticket ID." });
  }

  const ticketId = Number(idParam);

  try {
    const existingTicket = await ticketService.getTicketById(ticketId, user.role, false);
    if (!existingTicket) {
      return res.status(404).json({ message: "Ticket not found." });
    }

    const isAdmin = ["System Admin", "Platform Admin"].includes(user.role);
    const isOwner = String(existingTicket.requester_id) === String(user.user_id);

    // Only Admin or the Ticket Owner can delete
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "Forbidden: You are not authorized to delete this ticket." });
    }

    // Permanent deletion is only allowed for Admins via query param permanent=true
    const permanent = isAdmin && req.query.permanent === "true";
    const soft = !permanent;

    const success = await ticketService.deleteTicket(ticketId, soft);
    if (!success) {
      return res.status(404).json({ message: "Ticket could not be deleted." });
    }

    return res.status(200).json({
      message: soft ? "Ticket soft-deleted successfully" : "Ticket permanently deleted successfully"
    });
  } catch (error) {
    return handleError(res, error);
  }
};
