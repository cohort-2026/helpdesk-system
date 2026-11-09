export type TicketPriority = "High" | "Medium" | "Low";
export type TicketStatus = "Open" | "In progress" | "Pending approval" | "Resolved" | "Closed" | "Cancelled";

export const VALID_PRIORITIES: TicketPriority[] = ["High", "Medium", "Low"];
export const VALID_STATUSES: TicketStatus[] = [
  "Open",
  "In progress",
  "Pending approval",
  "Resolved",
  "Closed",
  "Cancelled"
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
  created_at: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
  department_name?: string | null;
  category_name?: string | null;
  request_type_name?: string | null;
  requester_name?: string | null;
  requester_email?: string | null;
  assignee_name?: string | null;
  assignee_email?: string | null;
}

export interface TicketComment {
  comment_id: number;
  ticket_id: number;
  author_id: string;
  body: string;
  is_internal: boolean;
  created_at: Date;
  updated_at?: Date;
  author_name?: string;
  author_email?: string;
  author_role?: string;
}

export interface TicketInternalNote {
  note_id: number;
  ticket_id: number;
  author: string;
  body: string;
  created_at: Date;
  author_name?: string;
  author_email?: string;
  author_role?: string;
}

export interface TicketFeedback {
  feedback_id: number;
  ticket_id: number;
  user_id: string;
  rating: number;
  comment?: string | null;
  created_at: Date;
  updated_at?: Date;
  user_name?: string;
  user_email?: string;
}

export interface TicketDetail extends Ticket {
  comments?: TicketComment[];
  internal_notes?: TicketInternalNote[];
  feedback?: TicketFeedback | null;
}

export interface CreateTicketDto {
  title: string;
  description?: string | null;
  priority?: TicketPriority;
  status?: TicketStatus;
  department_id?: number | null;
  category_id?: number | null;
  request_type_id?: number | null;
  requester_id: string;
  assignee_id?: string | null;
}

export interface UpdateTicketDto {
  title?: string;
  description?: string | null;
  priority?: TicketPriority;
  status?: TicketStatus;
  department_id?: number | null;
  category_id?: number | null;
  request_type_id?: number | null;
  assignee_id?: string | null;
}

export interface TicketFilters {
  status?: string | null;
  priority?: string | null;
  department_id?: number | null;
  creator_id?: string | null;
  assignee_id?: string | null;
  search?: string | null;
  page: number;
  limit: number;
  include_deleted?: boolean;
}

export interface PaginatedTicketsResult {
  tickets: Ticket[];
  total: number;
}
