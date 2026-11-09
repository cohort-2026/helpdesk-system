import axios, { AxiosError } from "axios";
import type {
  Ticket,
  CreateTicketPayload,
  TicketFilters,
  PaginatedTicketsResponse,
  TicketApiResponse,
  TicketApiError,
  TicketComment,
  TicketFeedback,
  AgentUser,
} from "../types/ticket.types";

const API = `${import.meta.env.VITE_API_URL ?? ""}/api`;

const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

/**
 * Extracts a user-friendly error message from an API error response.
 */
const extractErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError && error.response?.data) {
    const data = error.response.data as TicketApiError;
    if (data.errors && data.errors.length > 0) {
      return data.errors.join(" ");
    }
    return data.message || "An unexpected error occurred.";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred.";
};

/**
 * Create a new ticket.
 * POST /api/tickets/create
 */
export const createTicket = async (
  payload: CreateTicketPayload
): Promise<Ticket> => {
  try {
    const response = await api.post<TicketApiResponse>(
      "/tickets/create",
      payload
    );
    return response.data.ticket;
  } catch (error) {
    throw new Error(extractErrorMessage(error), { cause: error });
  }
};

/**
 * Fetch tickets with optional filters and pagination.
 * GET /api/tickets
 */
export const fetchTickets = async (
  filters: TicketFilters = {}
): Promise<PaginatedTicketsResponse> => {
  try {
    const params: Record<string, string | number> = {};

    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    if (filters.department_id !== undefined)
      params.department_id = filters.department_id;
    if (filters.creator_id) params.creator_id = filters.creator_id;
    if (filters.assignee_id) params.assignee_id = filters.assignee_id;
    if (filters.search) params.search = filters.search;
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;

    const response = await api.get<PaginatedTicketsResponse>("/tickets", {
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error), { cause: error });
  }
};

/**
 * Fetch a single ticket by ID.
 * GET /api/tickets/:id
 */
export const fetchTicketById = async (id: number): Promise<Ticket> => {
  try {
    const response = await api.get<{ ticket: Ticket }>(`/tickets/${id}`);
    return response.data.ticket;
  } catch (error) {
    throw new Error(extractErrorMessage(error), { cause: error });
  }
};

/**
 * Assign / claim a ticket.
 * PUT /api/tickets/:id/assign
 *
 * For self-assignment, omit assignee_id or pass the current user's ID.
 * Returns the HTTP status code alongside the data so the caller can
 * differentiate between 409 Conflict (race condition) and other errors.
 */
export const assignTicket = async (
  ticketId: number,
  assigneeId?: string | null
): Promise<Ticket> => {
  try {
    const body: Record<string, unknown> = {};
    if (assigneeId !== undefined && assigneeId !== null) {
      body.assignee_id = assigneeId;
    }
    const response = await api.put<TicketApiResponse>(
      `/tickets/${ticketId}/assign`,
      body
    );
    return response.data.ticket;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const status = error.response.status;
      const data = error.response.data as TicketApiError;
      const message = data.message || "Assignment failed.";

      // Enrich error with status code for race condition handling
      const enrichedError = new Error(message) as Error & {
        statusCode?: number;
      };
      enrichedError.statusCode = status;
      throw enrichedError;
    }
    throw new Error(extractErrorMessage(error), { cause: error });
  }
};

/**
 * Fetch all comments for a ticket.
 * GET /api/tickets/:ticket_id/comments
 */
export const fetchTicketComments = async (ticketId: number): Promise<TicketComment[]> => {
  try {
    const response = await api.get<{ comments: TicketComment[] }>(`/tickets/${ticketId}/comments`);
    return response.data.comments || [];
  } catch (error) {
    throw new Error(extractErrorMessage(error), { cause: error });
  }
};

/**
 * Add a comment or internal note to a ticket.
 * POST /api/tickets/:ticket_id/comments
 */
export const addTicketComment = async (
  ticketId: number,
  body: string,
  isInternal: boolean = false
): Promise<TicketComment> => {
  try {
    const response = await api.post<{ message: string; comment: TicketComment }>(
      `/tickets/${ticketId}/comments`,
      { body, is_internal: isInternal }
    );
    return response.data.comment;
  } catch (error) {
    throw new Error(extractErrorMessage(error), { cause: error });
  }
};

/**
 * Edit a specific comment.
 * PATCH /api/comments/:id
 */
export const updateComment = async (
  commentId: number,
  body: string
): Promise<TicketComment> => {
  try {
    const response = await api.patch<{ message: string; comment: TicketComment }>(
      `/comments/${commentId}`,
      { body }
    );
    return response.data.comment;
  } catch (error) {
    throw new Error(extractErrorMessage(error), { cause: error });
  }
};

/**
 * Delete a specific comment.
 * DELETE /api/comments/:id
 */
export const deleteComment = async (commentId: number): Promise<void> => {
  try {
    await api.delete(`/comments/${commentId}`);
  } catch (error) {
    throw new Error(extractErrorMessage(error), { cause: error });
  }
};

/**
 * Submit resolution rating and feedback for a resolved ticket.
 * POST /api/tickets/:ticket_id/feedback
 */
export const submitTicketFeedback = async (
  ticketId: number,
  rating: number,
  comment?: string
): Promise<TicketFeedback> => {
  try {
    const response = await api.post<{ message: string; feedback: TicketFeedback }>(
      `/tickets/${ticketId}/feedback`,
      { rating, comment }
    );
    return response.data.feedback;
  } catch (error) {
    throw new Error(extractErrorMessage(error), { cause: error });
  }
};

/**
 * Fetch resolution feedback for a ticket.
 * GET /api/tickets/:ticket_id/feedback
 */
export const fetchTicketFeedback = async (ticketId: number): Promise<TicketFeedback | null> => {
  try {
    const response = await api.get<{ feedback: TicketFeedback | null }>(`/tickets/${ticketId}/feedback`);
    return response.data.feedback;
  } catch (error) {
    throw new Error(extractErrorMessage(error), { cause: error });
  }
};

/**
 * Update ticket status.
 * PATCH /api/tickets/:id/status
 */
export const updateTicketStatus = async (
  ticketId: number,
  status: string
): Promise<Ticket> => {
  try {
    const response = await api.patch<{ message: string; ticket: Ticket }>(
      `/tickets/${ticketId}/status`,
      { status }
    );
    return response.data.ticket;
  } catch (error) {
    throw new Error(extractErrorMessage(error), { cause: error });
  }
};

/**
 * Approve a ticket pending approval (Lead/Admin).
 * PATCH /api/tickets/:id/approve
 */
export const approveTicket = async (
  ticketId: number,
  note?: string
): Promise<Ticket> => {
  try {
    const response = await api.patch<{ message: string; ticket: Ticket }>(
      `/tickets/${ticketId}/approve`,
      { note }
    );
    return response.data.ticket;
  } catch (error) {
    throw new Error(extractErrorMessage(error), { cause: error });
  }
};

/**
 * Reject a ticket pending approval (Lead/Admin).
 * PATCH /api/tickets/:id/reject
 */
export const rejectTicket = async (
  ticketId: number,
  reason?: string
): Promise<Ticket> => {
  try {
    const response = await api.patch<{ message: string; ticket: Ticket }>(
      `/tickets/${ticketId}/reject`,
      { reason }
    );
    return response.data.ticket;
  } catch (error) {
    throw new Error(extractErrorMessage(error), { cause: error });
  }
};

/**
 * Fetch available agents for ticket assignment/reassignment.
 * GET /api/tickets/agents
 */
export const fetchAgents = async (departmentId?: number): Promise<AgentUser[]> => {
  try {
    const params = departmentId ? { department_id: departmentId } : {};
    const response = await api.get<{ agents: AgentUser[] }>("/tickets/agents", { params });
    return response.data.agents || [];
  } catch (error) {
    throw new Error(extractErrorMessage(error), { cause: error });
  }
};
