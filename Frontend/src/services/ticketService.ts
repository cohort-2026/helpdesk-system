import axios, { AxiosError } from "axios";
import type {
  Ticket,
  CreateTicketPayload,
  TicketFilters,
  PaginatedTicketsResponse,
  TicketApiResponse,
  TicketApiError,
} from "../types/ticket.types";

const API = "http://localhost:5000/api";

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
    throw new Error(extractErrorMessage(error));
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
    throw new Error(extractErrorMessage(error));
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
    throw new Error(extractErrorMessage(error));
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
    throw new Error(extractErrorMessage(error));
  }
};
