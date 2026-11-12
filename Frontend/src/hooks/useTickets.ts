import { useState, useEffect, useCallback, useRef } from "react";
import * as ticketService from "../services/ticketService";
import type {
  Ticket,
  CreateTicketPayload,
  TicketFilters,
} from "../types/ticket.types";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UseTicketsOptions {
  /** Filters to apply when fetching tickets */
  filters?: TicketFilters;
  /** Whether to automatically fetch on mount (default true) */
  autoFetch?: boolean;
}

export const useTickets = (options: UseTicketsOptions = {}) => {
  const { filters = {}, autoFetch = true } = options;

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [isRefetching, setIsRefetching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const initialFetchDone = useRef(false);

  // Serialize filters to a stable string for dependency tracking
  const filtersKey = JSON.stringify(filters);

  const fetchAll = useCallback(
    async (isBackground: boolean = false) => {
      try {
        if (!isBackground && !initialFetchDone.current) {
          setLoading(true);
        } else {
          setIsRefetching(true);
        }
        setError(null);

        const parsed: TicketFilters = JSON.parse(filtersKey);
        const response = await ticketService.fetchTickets(parsed);

        setTickets(response.tickets);
        setPagination(response.pagination);
        initialFetchDone.current = true;

        return response.tickets;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch tickets";
        if (!initialFetchDone.current) {
          setError(message);
        }
        console.error("Failed to fetch tickets:", err);
        return [];
      } finally {
        setLoading(false);
        setIsRefetching(false);
      }
    },
    [filtersKey]
  );

  const createTicket = useCallback(
    async (payload: CreateTicketPayload): Promise<Ticket> => {
      setError(null);
      const ticket = await ticketService.createTicket(payload);

      // Optimistic addition
      setTickets((prev) => [ticket, ...prev]);

      // Background refetch to sync with server
      fetchAll(true);

      return ticket;
    },
    [fetchAll]
  );

  const claimTicket = useCallback(
    async (ticketId: number, assigneeId?: string | null): Promise<Ticket> => {
      setError(null);
      const updatedTicket = await ticketService.assignTicket(
        ticketId,
        assigneeId
      );

      // Optimistic removal from current list (ticket moves to assigned list)
      setTickets((prev) =>
        prev.filter((t) => t.ticket_id !== ticketId)
      );

      // Background refetch
      fetchAll(true);

      return updatedTicket;
    },
    [fetchAll]
  );

  // Auto-fetch on mount and when filters change
  useEffect(() => {
    if (autoFetch) {
      initialFetchDone.current = false;
      fetchAll(false);
    }
  }, [fetchAll, autoFetch]);

  return {
    tickets,
    pagination,
    loading,
    isRefetching,
    error,
    clearError: () => setError(null),
    fetchAll,
    refetch: () => fetchAll(true),
    createTicket,
    claimTicket,
  };
};
