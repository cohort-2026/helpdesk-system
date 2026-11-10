import { pool, query } from "../config/database";
import {
  Ticket,
  TicketDetail,
  TicketStatus,
  CreateTicketDto,
  UpdateTicketDto,
  TicketFilters,
  PaginatedTicketsResult,
  TicketComment,
  TicketInternalNote,
  TicketFeedback
} from "../types/ticket.types";
import { User } from "../types/user.types";
import {
  sendTicketAssignedEmail,
  sendTicketCommentEmail,
  sendTicketStatusEmail
} from "../utils/emailService";

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

  // Fetch comments: Employees only see public comments; staff see all comments including internal notes
  const isEmployee = userRole === "Employee";
  const commentFilter = isEmployee ? "AND c.is_internal = false" : "";
  const commentsResult = await pool.query(
    `SELECT c.comment_id, c.ticket_id, c.author_id, c.body, c.is_internal, c.created_at, c.updated_at,
            TRIM(CONCAT(u.name, ' ', u.surname)) AS author_name,
            u.email AS author_email,
            u.role AS author_role
     FROM comment c
     LEFT JOIN users u ON c.author_id = u.user_id
     WHERE c.ticket_id = $1 ${commentFilter}
     ORDER BY c.created_at ASC`,
    [ticketId]
  );
  ticket.comments = commentsResult.rows as TicketComment[];

  // Fetch internal notes for backward compatibility
  if (!isEmployee) {
    ticket.internal_notes = ticket.comments
      .filter(c => c.is_internal)
      .map(c => ({
        note_id: c.comment_id,
        ticket_id: c.ticket_id,
        author: c.author_id,
        body: c.body,
        created_at: c.created_at,
        author_name: c.author_name,
        author_email: c.author_email,
        author_role: c.author_role
      }));
  }

  // Fetch resolution feedback if any
  const feedbackResult = await pool.query(
    `SELECT fb.feedback_id, fb.ticket_id, fb.user_id, fb.rating, fb.comment, fb.created_at, fb.updated_at,
            TRIM(CONCAT(u.name, ' ', u.surname)) AS user_name,
            u.email AS user_email
     FROM ticket_feedback fb
     LEFT JOIN users u ON fb.user_id = u.user_id
     WHERE fb.ticket_id = $1`,
    [ticketId]
  );
  ticket.feedback = feedbackResult.rows[0] ? (feedbackResult.rows[0] as TicketFeedback) : null;

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

export const getCommentEditWindowMinutes = (): number => {
  const envVal = process.env.COMMENT_EDIT_WINDOW_MINUTES;
  if (envVal && !isNaN(parseInt(envVal, 10))) {
    return parseInt(envVal, 10);
  }
  return 15; // default configurable 15 minutes window
};

export interface CommentResult {
  success: boolean;
  statusCode: number;
  message: string;
  comment?: TicketComment;
}

export const getTicketComments = async (
  ticketId: number,
  currentUser: User
): Promise<{ success: boolean; statusCode: number; message: string; comments?: TicketComment[] }> => {
  const ticketRes = await pool.query(
    "SELECT ticket_id, requester_id, ticket_department_id, deleted_at FROM ticket WHERE ticket_id = $1",
    [ticketId]
  );

  if (ticketRes.rowCount === 0) {
    return { success: false, statusCode: 404, message: "Ticket not found." };
  }

  const ticket = ticketRes.rows[0];

  // Role-based access control: regular Employees can ONLY view comments on their own tickets
  if (currentUser.role === "Employee" && String(ticket.requester_id) !== String(currentUser.user_id)) {
    return {
      success: false,
      statusCode: 403,
      message: "Forbidden: You are not authorized to view comments for this ticket."
    };
  }

  const isEmployee = currentUser.role === "Employee";
  const commentFilter = isEmployee ? "AND c.is_internal = false" : "";

  const commentsResult = await pool.query(
    `SELECT c.comment_id, c.ticket_id, c.author_id, c.body, c.is_internal, c.created_at, c.updated_at,
            TRIM(CONCAT(u.name, ' ', u.surname)) AS author_name,
            u.email AS author_email,
            u.role AS author_role
     FROM comment c
     LEFT JOIN users u ON c.author_id = u.user_id
     WHERE c.ticket_id = $1 ${commentFilter}
     ORDER BY c.created_at ASC`,
    [ticketId]
  );

  return {
    success: true,
    statusCode: 200,
    message: "Comments retrieved successfully",
    comments: commentsResult.rows as TicketComment[]
  };
};

export const addComment = async (
  ticketId: number,
  currentUser: User,
  body: string,
  isInternal: boolean = false
): Promise<CommentResult> => {
  // Validate comment body
  if (!body || typeof body !== "string" || body.trim().length === 0) {
    return { success: false, statusCode: 400, message: "Comment body cannot be empty." };
  }

  const trimmedBody = body.trim();
  if (trimmedBody.length > 5000) {
    return { success: false, statusCode: 400, message: "Comment body cannot exceed 5000 characters." };
  }

  // Check ticket existence
  const ticketRes = await pool.query(
    `SELECT t.ticket_id, t.title, t.ticket_status, t.requester_id, t.assignee_id,
            req.email AS requester_email, TRIM(CONCAT(req.name, ' ', req.surname)) AS requester_name,
            asg.email AS assignee_email, TRIM(CONCAT(asg.name, ' ', asg.surname)) AS assignee_name
     FROM ticket t
     LEFT JOIN users req ON t.requester_id = req.user_id
     LEFT JOIN users asg ON t.assignee_id = asg.user_id
     WHERE t.ticket_id = $1 AND t.deleted_at IS NULL`,
    [ticketId]
  );

  if (ticketRes.rowCount === 0) {
    return { success: false, statusCode: 404, message: "Ticket not found." };
  }

  const ticket = ticketRes.rows[0];

  // RBAC checks:
  // Employees can only comment on their own tickets
  if (currentUser.role === "Employee" && String(ticket.requester_id) !== String(currentUser.user_id)) {
    return {
      success: false,
      statusCode: 403,
      message: "Forbidden: You are not authorized to post comments on this ticket."
    };
  }

  // Support Agents and Admins can flag a comment as an internal note. Employees CANNOT.
  if (isInternal && currentUser.role === "Employee") {
    return {
      success: false,
      statusCode: 403,
      message: "Forbidden: Employees are not permitted to post internal notes."
    };
  }

  // Insert comment
  const insertResult = await pool.query(
    `INSERT INTO comment (ticket_id, author_id, body, is_internal, created_at, updated_at)
     VALUES ($1, $2, $3, $4, NOW(), NOW())
     RETURNING comment_id, ticket_id, author_id, body, is_internal, created_at, updated_at`,
    [ticketId, currentUser.user_id, trimmedBody, isInternal]
  );

  const newComment = insertResult.rows[0];
  newComment.author_name = `${currentUser.name} ${currentUser.surname || ""}`.trim();
  newComment.author_email = currentUser.email;
  newComment.author_role = currentUser.role;

  // Also maintain internal_note table for backward compatibility if it is an internal note
  if (isInternal) {
    try {
      await pool.query(
        `INSERT INTO internal_note (ticket_id, author, body, created_at)
         VALUES ($1, $2, $3, NOW())`,
        [ticketId, currentUser.user_id, trimmedBody]
      );
    } catch (e) {
      console.warn("[ticketService] Note sync warning:", e);
    }
  }

  // Trigger email notifications:
  // "users recieve email notification for each posted comment"
  const authorName = `${currentUser.name} ${currentUser.surname || ""}`.trim();

  if (!isInternal) {
    // Public comment:
    // If author is the ticket requester -> notify the assigned agent (if assigned)
    if (String(currentUser.user_id) === String(ticket.requester_id)) {
      if (ticket.assignee_email) {
        sendTicketCommentEmail({
          recipientEmail: ticket.assignee_email,
          recipientName: ticket.assignee_name || "Support Agent",
          ticketId: ticket.ticket_id,
          ticketTitle: ticket.title,
          authorName,
          authorRole: currentUser.role,
          commentBody: trimmedBody,
          isInternal: false
        }).catch((err) => {
          console.error("[ticketService] Failed to send comment email to assignee:", err);
        });
      }
    } else {
      // Author is agent / lead / admin -> notify the ticket requester
      if (ticket.requester_email) {
        sendTicketCommentEmail({
          recipientEmail: ticket.requester_email,
          recipientName: ticket.requester_name || "Valued User",
          ticketId: ticket.ticket_id,
          ticketTitle: ticket.title,
          authorName,
          authorRole: currentUser.role,
          commentBody: trimmedBody,
          isInternal: false
        }).catch((err) => {
          console.error("[ticketService] Failed to send comment email to requester:", err);
        });
      }
    }
  } else {
    // Internal note:
    // Only notify assigned agent if author is not the assignee (never notify requester)
    if (ticket.assignee_email && String(currentUser.user_id) !== String(ticket.assignee_id)) {
      sendTicketCommentEmail({
        recipientEmail: ticket.assignee_email,
        recipientName: ticket.assignee_name || "Support Agent",
        ticketId: ticket.ticket_id,
        ticketTitle: ticket.title,
        authorName,
        authorRole: currentUser.role,
        commentBody: trimmedBody,
        isInternal: true
      }).catch((err) => {
        console.error("[ticketService] Failed to send internal note email to assignee:", err);
      });
    }
  }

  return {
    success: true,
    statusCode: 201,
    message: isInternal ? "Internal note posted successfully" : "Comment posted successfully",
    comment: newComment
  };
};

export const getCommentById = async (commentId: number): Promise<(TicketComment & { age_minutes?: number }) | null> => {
  const result = await pool.query(
    `SELECT c.comment_id, c.ticket_id, c.author_id, c.body, c.is_internal, c.created_at, c.updated_at,
            EXTRACT(EPOCH FROM (NOW() - c.created_at)) / 60.0 AS age_minutes,
            TRIM(CONCAT(u.name, ' ', u.surname)) AS author_name,
            u.email AS author_email,
            u.role AS author_role
     FROM comment c
     LEFT JOIN users u ON c.author_id = u.user_id
     WHERE c.comment_id = $1`,
    [commentId]
  );
  if (result.rowCount === 0) return null;
  return result.rows[0];
};

export const updateComment = async (
  commentId: number,
  currentUser: User,
  newBody: string
): Promise<CommentResult> => {
  if (!newBody || typeof newBody !== "string" || newBody.trim().length === 0) {
    return { success: false, statusCode: 400, message: "Comment body cannot be empty." };
  }

  const trimmedBody = newBody.trim();
  if (trimmedBody.length > 5000) {
    return { success: false, statusCode: 400, message: "Comment body cannot exceed 5000 characters." };
  }

  const existing = await getCommentById(commentId);
  if (!existing) {
    return { success: false, statusCode: 404, message: "Comment not found." };
  }

  const isAdmin = ["System Admin", "Platform Admin"].includes(currentUser.role);
  const isAuthor = String(existing.author_id) === String(currentUser.user_id);

  if (!isAdmin && !isAuthor) {
    return {
      success: false,
      statusCode: 403,
      message: "Forbidden: You are not authorized to edit this comment."
    };
  }

  // Requesters can edit their own comments within a configurable time window
  if (!isAdmin) {
    const windowMinutes = getCommentEditWindowMinutes();
    const ageMinutes = existing.age_minutes !== undefined
      ? Number(existing.age_minutes)
      : (Date.now() - new Date(existing.created_at).getTime()) / (1000 * 60);

    if (ageMinutes > windowMinutes) {
      return {
        success: false,
        statusCode: 403,
        message: `Forbidden: Comments can only be edited within ${windowMinutes} minutes of posting.`
      };
    }
  }

  const updateResult = await pool.query(
    `UPDATE comment
     SET body = $1, updated_at = NOW()
     WHERE comment_id = $2
     RETURNING comment_id, ticket_id, author_id, body, is_internal, created_at, updated_at`,
    [trimmedBody, commentId]
  );

  const updatedComment = updateResult.rows[0];
  updatedComment.author_name = existing.author_name;
  updatedComment.author_email = existing.author_email;
  updatedComment.author_role = existing.author_role;

  return {
    success: true,
    statusCode: 200,
    message: "Comment updated successfully",
    comment: updatedComment
  };
};

export const deleteComment = async (
  commentId: number,
  currentUser: User
): Promise<{ success: boolean; statusCode: number; message: string }> => {
  const existing = await getCommentById(commentId);
  if (!existing) {
    return { success: false, statusCode: 404, message: "Comment not found." };
  }

  const isAdmin = ["System Admin", "Platform Admin"].includes(currentUser.role);
  const isAuthor = String(existing.author_id) === String(currentUser.user_id);

  if (!isAdmin && !isAuthor) {
    return {
      success: false,
      statusCode: 403,
      message: "Forbidden: You are not authorized to delete this comment."
    };
  }

  // Requesters can delete their own comments within a configurable time window
  if (!isAdmin) {
    const windowMinutes = getCommentEditWindowMinutes();
    const ageMinutes = existing.age_minutes !== undefined
      ? Number(existing.age_minutes)
      : (Date.now() - new Date(existing.created_at).getTime()) / (1000 * 60);

    if (ageMinutes > windowMinutes) {
      return {
        success: false,
        statusCode: 403,
        message: `Forbidden: Comments can only be deleted within ${windowMinutes} minutes of posting.`
      };
    }
  }

  await pool.query("DELETE FROM comment WHERE comment_id = $1", [commentId]);

  return {
    success: true,
    statusCode: 200,
    message: "Comment deleted successfully."
  };
};

export const submitTicketFeedback = async (
  ticketId: number,
  currentUser: User,
  rating: number,
  comment?: string | null
): Promise<{ success: boolean; statusCode: number; message: string; feedback?: TicketFeedback }> => {
  const ticketRes = await pool.query(
    "SELECT ticket_id, requester_id, ticket_status, title FROM ticket WHERE ticket_id = $1 AND deleted_at IS NULL",
    [ticketId]
  );

  if (ticketRes.rowCount === 0) {
    return { success: false, statusCode: 404, message: "Ticket not found." };
  }

  const ticket = ticketRes.rows[0];

  // RBAC: Only ticket requester can submit resolution feedback
  if (String(ticket.requester_id) !== String(currentUser.user_id)) {
    return {
      success: false,
      statusCode: 403,
      message: "Forbidden: Only the ticket requester can submit resolution feedback."
    };
  }

  // Resolution feedback requirement: Requester can post rating/feedback only after a ticket is marked as Resolved or Closed.
  const normalizedStatus = String(ticket.ticket_status).trim().toLowerCase();
  if (normalizedStatus !== "resolved" && normalizedStatus !== "closed") {
    return {
      success: false,
      statusCode: 400,
      message: `Feedback can only be submitted for tickets that are Resolved or Closed. Current status is ${ticket.ticket_status}.`
    };
  }

  const ratingNum = Number(rating);
  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return {
      success: false,
      statusCode: 400,
      message: "Rating must be an integer between 1 and 5."
    };
  }

  const trimmedComment = comment !== undefined && comment !== null ? String(comment).trim() : null;

  const result = await pool.query(
    `INSERT INTO ticket_feedback (ticket_id, user_id, rating, comment, created_at, updated_at)
     VALUES ($1, $2, $3, $4, NOW(), NOW())
     ON CONFLICT (ticket_id) DO UPDATE
     SET rating = EXCLUDED.rating, comment = EXCLUDED.comment, updated_at = NOW()
     RETURNING feedback_id, ticket_id, user_id, rating, comment, created_at, updated_at`,
    [ticketId, currentUser.user_id, ratingNum, trimmedComment]
  );

  const fb = result.rows[0] as TicketFeedback;
  fb.user_name = `${currentUser.name} ${currentUser.surname || ""}`.trim();
  fb.user_email = currentUser.email;

  return {
    success: true,
    statusCode: 201,
    message: "Feedback submitted successfully.",
    feedback: fb
  };
};

export const getTicketFeedback = async (
  ticketId: number
): Promise<{ success: boolean; statusCode: number; message: string; feedback?: TicketFeedback | null }> => {
  const result = await pool.query(
    `SELECT fb.feedback_id, fb.ticket_id, fb.user_id, fb.rating, fb.comment, fb.created_at, fb.updated_at,
            TRIM(CONCAT(u.name, ' ', u.surname)) AS user_name,
            u.email AS user_email
     FROM ticket_feedback fb
     LEFT JOIN users u ON fb.user_id = u.user_id
     WHERE fb.ticket_id = $1`,
    [ticketId]
  );

  return {
    success: true,
    statusCode: 200,
    message: "Feedback retrieved successfully",
    feedback: result.rows[0] ? (result.rows[0] as TicketFeedback) : null
  };
};

export const updateTicketStatus = async (
  ticketId: number,
  newStatus: TicketStatus,
  currentUser: User
): Promise<{ success: boolean; statusCode: number; message: string; ticket?: TicketDetail }> => {
  const allowedRoles = ["Agent", "Department Lead", "System Admin", "Platform Admin"];
  const isStaff = allowedRoles.includes(currentUser.role);

  const existingTicket = await getTicketById(ticketId, currentUser.role, false);
  if (!existingTicket) {
    return { success: false, statusCode: 404, message: "Ticket not found." };
  }

  // Employees can only cancel their own tickets
  if (currentUser.role === "Employee") {
    if (String(existingTicket.requester_id) !== String(currentUser.user_id)) {
      return { success: false, statusCode: 403, message: "Forbidden: You are not authorized to update this ticket." };
    }
    if (newStatus !== "Cancelled") {
      return { success: false, statusCode: 403, message: "Forbidden: Employees can only cancel their own tickets." };
    }
  } else if (!isStaff) {
    return { success: false, statusCode: 403, message: "Forbidden: You do not have permission to change ticket status." };
  }

  const oldStatus = existingTicket.ticket_status;

  await pool.query(
    "UPDATE ticket SET ticket_status = $1, updated_at = NOW() WHERE ticket_id = $2",
    [newStatus, ticketId]
  );

  const updatedTicket = await getTicketById(ticketId, currentUser.role, false);

  // Notify requester via email if status changed
  if (updatedTicket && updatedTicket.requester_email && oldStatus !== newStatus) {
    sendTicketStatusEmail({
      recipientEmail: updatedTicket.requester_email,
      recipientName: updatedTicket.requester_name || "Valued User",
      ticketId: updatedTicket.ticket_id,
      ticketTitle: updatedTicket.title,
      oldStatus,
      newStatus,
      updatedByName: `${currentUser.name} ${currentUser.surname || ""}`.trim()
    }).catch((err) => {
      console.error("[ticketService] Failed to send status update email:", err);
    });
  }

  return {
    success: true,
    statusCode: 200,
    message: `Ticket status updated to ${newStatus}`,
    ticket: updatedTicket!
  };
};

export const approveTicket = async (
  ticketId: number,
  currentUser: User,
  note?: string
): Promise<{ success: boolean; statusCode: number; message: string; ticket?: TicketDetail }> => {
  const allowedRoles = ["Department Lead", "System Admin", "Platform Admin"];
  if (!allowedRoles.includes(currentUser.role)) {
    return {
      success: false,
      statusCode: 403,
      message: "Forbidden: Only Department Leads and Administrators can approve requests."
    };
  }

  const existingTicket = await getTicketById(ticketId, currentUser.role, false);
  if (!existingTicket) {
    return { success: false, statusCode: 404, message: "Ticket not found." };
  }

  if (existingTicket.ticket_status.toLowerCase() !== "pending approval") {
    return {
      success: false,
      statusCode: 400,
      message: `Ticket is not pending approval. Current status is ${existingTicket.ticket_status}.`
    };
  }

  // When approved: transition to In progress if assigned, otherwise Open
  const nextStatus: TicketStatus = existingTicket.assignee_id ? "In progress" : "Open";

  await pool.query(
    "UPDATE ticket SET ticket_status = $1, updated_at = NOW() WHERE ticket_id = $2",
    [nextStatus, ticketId]
  );

  // Add internal audit note
  const authorName = `${currentUser.name} ${currentUser.surname || ""}`.trim();
  const noteBody = note ? `Request Approved: ${note}` : `Request approved by ${authorName} (${currentUser.role}).`;
  await addComment(ticketId, currentUser, noteBody, true);

  const updatedTicket = await getTicketById(ticketId, currentUser.role, false);
  return {
    success: true,
    statusCode: 200,
    message: "Ticket approved successfully.",
    ticket: updatedTicket!
  };
};

export const rejectTicket = async (
  ticketId: number,
  currentUser: User,
  reason?: string
): Promise<{ success: boolean; statusCode: number; message: string; ticket?: TicketDetail }> => {
  const allowedRoles = ["Department Lead", "System Admin", "Platform Admin"];
  if (!allowedRoles.includes(currentUser.role)) {
    return {
      success: false,
      statusCode: 403,
      message: "Forbidden: Only Department Leads and Administrators can reject requests."
    };
  }

  const existingTicket = await getTicketById(ticketId, currentUser.role, false);
  if (!existingTicket) {
    return { success: false, statusCode: 404, message: "Ticket not found." };
  }

  if (existingTicket.ticket_status.toLowerCase() !== "pending approval") {
    return {
      success: false,
      statusCode: 400,
      message: `Ticket is not pending approval. Current status is ${existingTicket.ticket_status}.`
    };
  }

  // Reject moves to Cancelled
  await pool.query(
    "UPDATE ticket SET ticket_status = 'Cancelled', updated_at = NOW() WHERE ticket_id = $1",
    [ticketId]
  );

  const authorName = `${currentUser.name} ${currentUser.surname || ""}`.trim();
  const noteBody = reason ? `Request Rejected: ${reason}` : `Request rejected by ${authorName} (${currentUser.role}).`;
  await addComment(ticketId, currentUser, noteBody, true);

  const updatedTicket = await getTicketById(ticketId, currentUser.role, false);
  return {
    success: true,
    statusCode: 200,
    message: "Ticket rejected successfully.",
    ticket: updatedTicket!
  };
};

export const getAvailableAgents = async (departmentId?: number | null) => {
  const conditions = ["u.active = true", "u.role IN ('Agent', 'Department Lead', 'System Admin', 'Platform Admin')"];
  const params: any[] = [];

  if (departmentId !== undefined && departmentId !== null) {
    conditions.push("(u.department_id = $1 OR u.role IN ('System Admin', 'Platform Admin'))");
    params.push(departmentId);
  }

  const res = await pool.query(
    `SELECT u.user_id, u.name, u.surname, u.email, u.role, u.department_id, d.department_name
     FROM users u
     LEFT JOIN department d ON u.department_id = d.department_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY u.name ASC, u.surname ASC`,
    params
  );

  return res.rows;
};

