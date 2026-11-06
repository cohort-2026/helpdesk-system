export type TicketPriority = "High" | "Medium" | "Low";
export type TicketStatus =
  | "Open"
  | "In progress"
  | "Pending approval"
  | "Resolved"
  | "Closed"
  | "Cancelled";

export const VALID_PRIORITIES: TicketPriority[] = ["High", "Medium", "Low"];
export const VALID_STATUSES: TicketStatus[] = [
  "Open",
  "In progress",
  "Pending approval",
  "Resolved",
  "Closed",
  "Cancelled",
];

export interface Ticket {
  ticket_id: number;
  title: string;
  description: string | null;
  ticket_department_id: number | null;
  ticket_category_id: number | null;
  ticket_request_type_id: number | null;
  ticket_priority: TicketPriority;
  ticket_status: TicketStatus;
  requester_id: string | null;
  assignee_id: string | null;
  created_at: string;
  updated_at?: string;
  deleted_at?: string | null;
  department_name?: string | null;
  category_name?: string | null;
  request_type_name?: string | null;
  requester_name?: string | null;
  requester_email?: string | null;
  assignee_name?: string | null;
  assignee_email?: string | null;
}

export interface CreateTicketPayload {
  title: string;
  description?: string | null;
  priority?: TicketPriority;
  department_id?: number | null;
  category_id?: number | null;
  request_type_id?: number | null;
}

export interface TicketFilters {
  status?: string;
  priority?: string;
  department_id?: number;
  creator_id?: string;
  assignee_id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedTicketsResponse {
  tickets: Ticket[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TicketApiResponse {
  message: string;
  ticket: Ticket;
}

export interface TicketApiError {
  message: string;
  errors?: string[];
}
