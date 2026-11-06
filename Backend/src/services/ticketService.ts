import { pool, query } from "../config/database";
import {
  Ticket,
  TicketDetail,
  CreateTicketDto,
  UpdateTicketDto,
  TicketFilters,
  PaginatedTicketsResult,
  TicketComment,
  TicketInternalNote
} from "../types/ticket.types";
import { User } from "../types/user.types";
import { sendTicketAssignedEmail } from "../utils/emailService";

const TICKET_SELECT_FIELDS = `
  t.ticket_id,
  t.title,
  t.description,
  t.ticket_department_id,
  t.ticket_category_id,
  t.ticket_request_type_id,
  t.ticket_priority,
  t.ticket_status,
  t.requester_id,
  t.assignee_id,
  t.created_at,
  t.updated_at,
  t.deleted_at,
  d.department_name,
  c.category_name,
  rt.request_type_name,
  TRIM(CONCAT(req_u.name, ' ', req_u.surname)) AS requester_name,
  req_u.email AS requester_email,
  TRIM(CONCAT(asg_u.name, ' ', asg_u.surname)) AS assignee_name,
  asg_u.email AS assignee_email
`;

const TICKET_JOINS = `
  LEFT JOIN department d ON t.ticket_department_id = d.department_id
  LEFT JOIN category c ON t.ticket_category_id = c.category_id
  LEFT JOIN request_type rt ON t.ticket_request_type_id = rt.request_type_id
  LEFT JOIN users req_u ON t.requester_id = req_u.user_id
  LEFT JOIN users asg_u ON t.assignee_id = asg_u.user_id
`;

export const checkDepartmentExists = async (departmentId: number): Promise<boolean> => {
  const result = await query("SELECT 1 FROM department WHERE department_id = $1", [departmentId]);
  return (result.rowCount ?? 0) > 0;
};

export const checkUserExists = async (userId: string | number): Promise<boolean> => {
  const result = await query("SELECT 1 FROM users WHERE user_id = $1", [userId]);
  return (result.rowCount ?? 0) > 0;
};

export const checkCategoryExists = async (categoryId: number): Promise<boolean> => {
  const result = await query("SELECT 1 FROM category WHERE category_id = $1", [categoryId]);
  return (result.rowCount ?? 0) > 0;
};

export const checkRequestTypeExists = async (requestTypeId: number): Promise<boolean> => {
  const result = await query("SELECT 1 FROM request_type WHERE request_type_id = $1", [requestTypeId]);
  return (result.rowCount ?? 0) > 0;
};

export const createTicket = async (dto: CreateTicketDto): Promise<Ticket> => {
  const {
    title,
    description = null,
    priority = "Low",
    status = "Open",
    department_id = null,
    category_id = null,
    request_type_id = null,
    requester_id,
    assignee_id = null,
  } = dto;

  const insertResult = await pool.query(
    `INSERT INTO ticket (
      title,
      description,
      ticket_department_id,
      ticket_category_id,
      ticket_request_type_id,
      ticket_priority,
      ticket_status,
      requester_id,
      assignee_id,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
    RETURNING ticket_id`,
    [
      title,
      description,
      department_id,
      category_id,
      request_type_id,
      priority,
      status,
      requester_id,
      assignee_id
    ]
  );

  const ticketId = insertResult.rows[0].ticket_id;
  const fullTicket = await getTicketById(ticketId);
  return fullTicket!;
};

export const getTickets = async (
  filters: TicketFilters,
  userRole: string,
  currentUserId: string
): Promise<PaginatedTicketsResult> => {
  const {
    status,
    priority,
    department_id,
    creator_id,
    assignee_id,
    search,
    page = 1,
    limit = 10,
    include_deleted = false,
  } = filters;

  const conditions: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  // Soft deletion filtering
  if (!include_deleted) {
    conditions.push("t.deleted_at IS NULL");
  }

  // RBAC scope: Regular Employees can ONLY see their own tickets
  if (userRole === "Employee") {
    conditions.push(`t.requester_id = $${paramIndex++}`);
    values.push(currentUserId);
  } else if (creator_id) {
    // Other roles can filter by specific creator
    conditions.push(`t.requester_id = $${paramIndex++}`);
    values.push(creator_id);
  }

  // Filter by status
  if (status) {
    conditions.push(`LOWER(t.ticket_status::text) = LOWER($${paramIndex++})`);
    values.push(status);
  }

  // Filter by priority
  if (priority) {
    conditions.push(`LOWER(t.ticket_priority::text) = LOWER($${paramIndex++})`);
    values.push(priority);
  }

  // Filter by department
  if (department_id !== undefined && department_id !== null) {
    conditions.push(`t.ticket_department_id = $${paramIndex++}`);
    values.push(department_id);
  }

  // Filter by assignee
  if (assignee_id) {
    conditions.push(`t.assignee_id = $${paramIndex++}`);
    values.push(assignee_id);
  }

  // Search by title or description
  if (search && search.trim().length > 0) {
    conditions.push(`(t.title ILIKE '%' || $${paramIndex} || '%' OR t.description ILIKE '%' || $${paramIndex} || '%')`);
    values.push(search.trim());
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Count query
  const countQuery = `
    SELECT COUNT(*)::int AS total
    FROM ticket t
    ${whereClause}
  `;
  const countResult = await pool.query(countQuery, values);
  const total = countResult.rows[0]?.total || 0;

  // Data query with pagination
  const offset = (page - 1) * limit;
  const dataQuery = `
    SELECT ${TICKET_SELECT_FIELDS}
    FROM ticket t
    ${TICKET_JOINS}
    ${whereClause}
    ORDER BY t.created_at DESC
    LIMIT $${paramIndex++} OFFSET $${paramIndex++}
  `;
  values.push(limit, offset);

  const dataResult = await pool.query(dataQuery, values);
  return { tickets: dataResult.rows, total };
};

export const getTicketById = async (
  ticketId: number,
  userRole?: string,
  includeDeleted = false
): Promise<TicketDetail | null> => {
  const whereDeleted = includeDeleted ? "" : "AND t.deleted_at IS NULL";
  const result = await pool.query(
    `SELECT ${TICKET_SELECT_FIELDS}
     FROM ticket t
     ${TICKET_JOINS}
     WHERE t.ticket_id = $1 ${whereDeleted}`,
    [ticketId]
  );

  if (result.rowCount === 0) {
    return null;
  }

  const ticket: TicketDetail = result.rows[0];

  // Fetch comments (accessible to all who have access to the ticket)
  const commentsResult = await pool.query(
    `SELECT c.comment_id, c.ticket_id, c.author_id, c.body, c.created_at,
            TRIM(CONCAT(u.name, ' ', u.surname)) AS author_name,
            u.email AS author_email,
            u.role AS author_role
     FROM comment c
     LEFT JOIN users u ON c.author_id = u.user_id
     WHERE c.ticket_id = $1
     ORDER BY c.created_at ASC`,
    [ticketId]
  );
  ticket.comments = commentsResult.rows as TicketComment[];

  // Fetch internal notes (only for non-Employees: Agent, Department Lead, System Admin, Platform Admin)
  if (userRole && userRole !== "Employee") {
    const notesResult = await pool.query(
      `SELECT n.note_id, n.ticket_id, n.author, n.body, n.created_at,
              TRIM(CONCAT(u.name, ' ', u.surname)) AS author_name,
              u.email AS author_email,
              u.role AS author_role
       FROM internal_note n
       LEFT JOIN users u ON n.author = u.user_id
       WHERE n.ticket_id = $1
       ORDER BY n.created_at ASC`,
      [ticketId]
    );
    ticket.internal_notes = notesResult.rows as TicketInternalNote[];
  }

  return ticket;
};

export const updateTicket = async (
  ticketId: number,
  updateData: UpdateTicketDto
): Promise<Ticket | null> => {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updateData.title !== undefined) {
    fields.push(`title = $${paramIndex++}`);
    values.push(updateData.title);
  }
  if (updateData.description !== undefined) {
    fields.push(`description = $${paramIndex++}`);
    values.push(updateData.description);
  }
  if (updateData.priority !== undefined) {
    fields.push(`ticket_priority = $${paramIndex++}`);
    values.push(updateData.priority);
  }
  if (updateData.status !== undefined) {
    fields.push(`ticket_status = $${paramIndex++}`);
    values.push(updateData.status);
  }
  if (updateData.department_id !== undefined) {
    fields.push(`ticket_department_id = $${paramIndex++}`);
    values.push(updateData.department_id);
  }
  if (updateData.category_id !== undefined) {
    fields.push(`ticket_category_id = $${paramIndex++}`);
    values.push(updateData.category_id);
  }
  if (updateData.request_type_id !== undefined) {
    fields.push(`ticket_request_type_id = $${paramIndex++}`);
    values.push(updateData.request_type_id);
  }
  if (updateData.assignee_id !== undefined) {
    fields.push(`assignee_id = $${paramIndex++}`);
    values.push(updateData.assignee_id);
  }

  if (fields.length === 0) {
    return getTicketById(ticketId);
  }

  fields.push(`updated_at = NOW()`);
  values.push(ticketId);

  const updateQuery = `
    UPDATE ticket
    SET ${fields.join(", ")}
    WHERE ticket_id = $${paramIndex}
    RETURNING ticket_id
  `;

  const result = await pool.query(updateQuery, values);
  if (result.rowCount === 0) {
    return null;
  }

  return getTicketById(ticketId);
};

export const deleteTicket = async (
  ticketId: number,
  softDelete: boolean = true
): Promise<boolean> => {
  if (softDelete) {
    const result = await pool.query(
      `UPDATE ticket
       SET deleted_at = NOW(), ticket_status = 'Cancelled', updated_at = NOW()
       WHERE ticket_id = $1 AND deleted_at IS NULL
       RETURNING ticket_id`,
      [ticketId]
    );
    return (result.rowCount ?? 0) > 0;
  } else {
    // Permanent deletion: clean up child records first
    await pool.query("DELETE FROM comment WHERE ticket_id = $1", [ticketId]);
    await pool.query("DELETE FROM internal_note WHERE ticket_id = $1", [ticketId]);
    const result = await pool.query("DELETE FROM ticket WHERE ticket_id = $1 RETURNING ticket_id", [ticketId]);
    return (result.rowCount ?? 0) > 0;
  }
};

export interface AssignTicketResult {
  success: boolean;
  statusCode: number;
  message: string;
  ticket?: TicketDetail;
}

export const assignTicket = async (
  ticketId: number,
  currentUser: User,
  assigneeId?: string | null
): Promise<AssignTicketResult> => {
  const allowedRoles = ["Agent", "Department Lead", "System Admin", "Platform Admin"];
  if (!allowedRoles.includes(currentUser.role)) {
    return {
      success: false,
      statusCode: 403,
      message: "Forbidden: Only support agents, department leads, and administrators can assign tickets."
    };
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Lock ticket row for update to prevent concurrent double-claiming
    const ticketResult = await client.query(
      `SELECT t.*, d.department_name
       FROM ticket t
       LEFT JOIN department d ON t.ticket_department_id = d.department_id
       WHERE t.ticket_id = $1 AND t.deleted_at IS NULL
       FOR UPDATE OF t`,
      [ticketId]
    );

    if (ticketResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return {
        success: false,
        statusCode: 404,
        message: "Ticket not found."
      };
    }

    const ticket = ticketResult.rows[0];

    // Status validation: cannot assign closed, resolved, or cancelled tickets
    const terminalStatuses = ["Closed", "Resolved", "Cancelled"];
    if (terminalStatuses.includes(ticket.ticket_status)) {
      await client.query("ROLLBACK");
      return {
        success: false,
        statusCode: 400,
        message: `Cannot assign a ${ticket.ticket_status.toLowerCase()} ticket.`
      };
    }

    let resolvedAssigneeId: string;

    if (currentUser.role === "Agent") {
      // Support Agents can only self-assign
      if (assigneeId !== undefined && assigneeId !== null && String(assigneeId).trim() !== "" && String(assigneeId).trim() !== String(currentUser.user_id)) {
        await client.query("ROLLBACK");
        return {
          success: false,
          statusCode: 403,
          message: "Forbidden: Support agents can only assign tickets to themselves."
        };
      }
      resolvedAssigneeId = String(currentUser.user_id);

      // Validate department: requesting agent must belong to the same department as the ticket
      if (
        currentUser.department_id === null ||
        currentUser.department_id === undefined ||
        ticket.ticket_department_id === null ||
        Number(currentUser.department_id) !== Number(ticket.ticket_department_id)
      ) {
        await client.query("ROLLBACK");
        return {
          success: false,
          statusCode: 403,
          message: "Forbidden: You can only assign tickets within your assigned department."
        };
      }

      // Validate unassigned: agents can only claim unassigned tickets (prevent double-claiming)
      if (ticket.assignee_id !== null && ticket.assignee_id !== undefined) {
        await client.query("ROLLBACK");
        return {
          success: false,
          statusCode: 409,
          message: "Ticket is already assigned."
        };
      }
    } else {
      // Department Lead, System Admin, Platform Admin
      // Department leads can assign any ticket to any agent (or self-assign)
      if (assigneeId !== undefined && assigneeId !== null && String(assigneeId).trim() !== "") {
        resolvedAssigneeId = String(assigneeId).trim();
      } else {
        resolvedAssigneeId = String(currentUser.user_id);
      }

      // If assigning to another user, validate that target user exists, is active, and is support staff
      if (resolvedAssigneeId !== String(currentUser.user_id)) {
        const targetUserRes = await client.query(
          "SELECT user_id, name, surname, email, role, active FROM users WHERE user_id = $1",
          [resolvedAssigneeId]
        );

        if (targetUserRes.rowCount === 0) {
          await client.query("ROLLBACK");
          return {
            success: false,
            statusCode: 400,
            message: "Assignee user not found."
          };
        }

        const targetUser = targetUserRes.rows[0];
        if (!targetUser.active) {
          await client.query("ROLLBACK");
          return {
            success: false,
            statusCode: 400,
            message: "Assignee user is inactive."
          };
        }

        const staffRoles = ["Agent", "Department Lead", "System Admin", "Platform Admin"];
        if (!staffRoles.includes(targetUser.role)) {
          await client.query("ROLLBACK");
          return {
            success: false,
            statusCode: 400,
            message: "Tickets can only be assigned to support staff (agents or leads)."
          };
        }
      }
    }

    // Automatically update ticket status: transition from 'Open' to 'In progress' upon assignment
    let newStatus = ticket.ticket_status;
    if (ticket.ticket_status === "Open") {
      newStatus = "In progress";
    }

    await client.query(
      `UPDATE ticket
       SET assignee_id = $1,
           ticket_status = $2,
           updated_at = NOW()
       WHERE ticket_id = $3`,
      [resolvedAssigneeId, newStatus, ticketId]
    );

    await client.query("COMMIT");

    // Fetch updated ticket with requester & assignee details
    const fullTicket = await getTicketById(ticketId, currentUser.role, false);

    // Trigger email notification to employee (ticket requester)
    if (fullTicket && fullTicket.requester_email) {
      sendTicketAssignedEmail({
        recipientEmail: fullTicket.requester_email,
        recipientName: fullTicket.requester_name || "Valued User",
        ticketId: fullTicket.ticket_id,
        ticketTitle: fullTicket.title,
        assigneeName: fullTicket.assignee_name || "Support Agent",
        status: fullTicket.ticket_status,
      }).catch((err) => {
        console.error("[ticketService] Failed to send ticket assignment email:", err);
      });
    }

    return {
      success: true,
      statusCode: 200,
      message: "Ticket assigned successfully",
      ticket: fullTicket!
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

