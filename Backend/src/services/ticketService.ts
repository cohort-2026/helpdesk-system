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
