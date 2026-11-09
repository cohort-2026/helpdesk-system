import { useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useTickets } from "../../hooks/useTickets";
import { useToast } from "../../hooks/useToast";
import type { Ticket } from "../../types/ticket.types";
import Loader from "../../components/ui/Loader";

const TicketQueue = () => {
  const { user } = useAuth();
  const { toastElement, showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [claimingId, setClaimingId] = useState<number | null>(null);

  // Fetch unassigned Open tickets for the agent's department
  const departmentId = user?.department_id ?? undefined;
  const { tickets, loading, error, claimTicket, refetch } = useTickets({
    filters: {
      status: "Open",
      department_id: departmentId ? Number(departmentId) : undefined,
      limit: 100,
    },
    autoFetch: true,
  });

  // Only show truly unassigned tickets
  const unassignedTickets = tickets.filter(
    (t) => !t.assignee_id || t.assignee_id === null,
  );

  // Client-side search and priority filtering
  const filteredTickets = unassignedTickets.filter((t: Ticket) => {
    const matchesSearch =
      `HD-${t.ticket_id} ${t.title} ${t.requester_name || ""}`
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchesPriority =
      priorityFilter === "All" || t.ticket_priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const handleClaim = useCallback(
    async (ticketId: number) => {
      setClaimingId(ticketId);
      try {
        await claimTicket(ticketId);
        showToast(
          "Ticket claimed successfully! It's now in your assigned tickets.",
          "success",
        );
      } catch (err: unknown) {
        const error = err as Error & { statusCode?: number };
        if (error.statusCode === 409) {
          showToast(
            "This ticket was already claimed by another agent. Refreshing queue…",
            "warning",
          );
          refetch();
        } else if (error.statusCode === 403) {
          showToast(
            error.message || "You're not authorized to claim this ticket.",
            "error",
          );
        } else {
          showToast(error.message || "Failed to claim ticket.", "error");
        }
      } finally {
        setClaimingId(null);
      }
    },
    [claimTicket, showToast, refetch],
  );

  const priorityColor = (p: string) => {
    if (p === "High") return "bg-red-50 text-red-600";
    if (p === "Medium") return "bg-yellow-50 text-yellow-700";
    return "bg-green-50 text-green-700";
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-ZA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate time ago for display
  const timeAgo = (date: string) => {
    const now = new Date();
    const created = new Date(date);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (error && !loading) {
    showToast(error, "error");
  }

  return (
    <div className="space-y-6">
      {toastElement}

      {/* Page Heading */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-body-text">
            Department Ticket Queue
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Open tickets awaiting assignment in your department.
          </p>
        </div>

        <button
          id="refresh-queue-btn"
          onClick={() => refetch()}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:border-[#6A89A7]"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          id="queue-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by ID, title or requester…"
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-[#6A89A7] sm:max-w-md transition-colors"
        />

        <select
          id="queue-priority-filter"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-[#6A89A7] transition-colors"
        >
          <option value="All">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* Loading State */}
      {loading && <Loader />}

      {/* Ticket Cards */}
      {!loading && (
        <div className="space-y-3">
          {filteredTickets.length > 0 ? (
            filteredTickets.map((ticket: Ticket) => (
              <div
                key={ticket.ticket_id}
                onClick={() =>
                  navigate(
                    `/${location.pathname.split("/")[1]}/tickets/${ticket.ticket_id}`,
                  )
                }
                className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-[#6A89A7] hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
              >
                {/* Ticket Info */}
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-[#6A89A7]">
                      HD-{ticket.ticket_id}
                    </p>
                    <span className="text-[11px] text-gray-400">
                      {timeAgo(ticket.created_at)}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-gray-800">
                    {ticket.title}
                  </h3>

                  {ticket.description && (
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {ticket.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 pt-1">
                    {ticket.requester_name && (
                      <span>Requester: {ticket.requester_name}</span>
                    )}
                    {ticket.department_name && (
                      <span>Dept: {ticket.department_name}</span>
                    )}
                    <span>Created: {formatDate(ticket.created_at)}</span>
                  </div>
                </div>

                {/* Right side: Priority + Claim button */}
                <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                  <span
                    className={`rounded-sm px-3 py-1 text-xs font-medium ${priorityColor(ticket.ticket_priority)}`}
                  >
                    {ticket.ticket_priority}
                  </span>

                  <span className="rounded-sm px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700">
                    {ticket.ticket_status}
                  </span>

                  <button
                    id={`claim-ticket-${ticket.ticket_id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClaim(ticket.ticket_id);
                    }}
                    disabled={claimingId === ticket.ticket_id}
                    className="ml-2 inline-flex items-center gap-1.5 rounded-md bg-[#6A89A7] px-4 py-2 text-xs font-medium text-white transition-all hover:bg-[#5a7a98] disabled:bg-gray-300 disabled:cursor-not-allowed active:scale-[0.98]"
                  >
                    {claimingId === ticket.ticket_id ? (
                      <>
                        <span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></span>
                        Claiming…
                      </>
                    ) : (
                      <>
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        Assign to Me
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-md border border-dashed border-gray-300 p-10 text-center">
              <div className="mb-2">
                <svg
                  className="mx-auto h-10 w-10 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-700">
                No open tickets in the queue
              </p>
              <p className="mt-2 text-sm text-gray-500">
                All department tickets are currently assigned. Check back later!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Ticket Count */}
      {!loading && unassignedTickets.length > 0 && (
        <p className="text-xs text-gray-500">
          Showing {filteredTickets.length} of {unassignedTickets.length}{" "}
          unassigned tickets
        </p>
      )}
    </div>
  );
};

export default TicketQueue;
