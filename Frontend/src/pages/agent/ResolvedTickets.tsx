import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTickets } from "../../hooks/useTickets";
import { useToast } from "../../components/ui/Toast";
import type { Ticket } from "../../types/ticket.types";
import Loader from "../../components/ui/Loader";

type DateRange = "all" | "today" | "7days" | "30days";

const ResolvedTickets = () => {
  const { user } = useAuth();
  const { toastElement, showToast } = useToast();
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>("all");

  const userId = user?.id || user?.user_id || "";

  const { tickets: allTickets, loading, error } = useTickets({
    filters: {
      assignee_id: userId ? String(userId) : undefined,
      limit: 100,
    },
    autoFetch: !!userId,
  });

  // Only show Resolved / Closed tickets
  const resolvedTickets = allTickets.filter(
    (t) => t.ticket_status === "Resolved" || t.ticket_status === "Closed"
  );

  const now = new Date();

  // Check if a ticket was resolved today
  const isToday = (date: string) => {
    const resolvedDate = new Date(date);
    return resolvedDate.toDateString() === now.toDateString();
  };

  // Check if a ticket was resolved within the selected number of days
  const isWithinDays = (date: string, days: number) => {
    const resolvedDate = new Date(date);
    const startDate = new Date();
    startDate.setDate(now.getDate() - days);
    startDate.setHours(0, 0, 0, 0);
    return resolvedDate >= startDate && resolvedDate <= now;
  };

  // Search and filter the resolved tickets
  const filteredTickets = resolvedTickets.filter((ticket: Ticket) => {
    const matchesSearch =
      `HD-${ticket.ticket_id}`.toLowerCase().includes(search.toLowerCase()) ||
      ticket.title.toLowerCase().includes(search.toLowerCase()) ||
      (ticket.requester_name || "").toLowerCase().includes(search.toLowerCase());

    let matchesDate = true;
    const dateToCheck = ticket.updated_at || ticket.created_at;

    if (dateRange === "today") {
      matchesDate = isToday(dateToCheck);
    } else if (dateRange === "7days") {
      matchesDate = isWithinDays(dateToCheck, 7);
    } else if (dateRange === "30days") {
      matchesDate = isWithinDays(dateToCheck, 30);
    }

    return matchesSearch && matchesDate;
  });

  // Format resolution date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-ZA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (error && !loading) {
    showToast(error, "error");
  }

  return (
    <div className="space-y-6">
      {toastElement}

      {/* Page Heading */}
      <div>
        <h1 className="text-2xl font-bold text-body-text">
          Resolved Tickets
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Review tickets you have previously resolved or closed.
        </p>
      </div>

      {/* Ticket History */}
      <div className="rounded-xl p-5 shadow-sm">
 

        {/* Search and Date Filter */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {/* Search */}
          <input
            id="resolved-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, title or reporter…"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-[#6A89A7] focus:ring-1 focus:ring-[#6A89A7] transition-colors"
          />

          {/* Date Filter */}
          <select
            id="resolved-date-filter"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-[#6A89A7] transition-colors"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>
        </div>

        {/* Loading State */}
        {loading && (
           <Loader/>

        )}

        {/* Resolved Ticket Cards */}
        {!loading && (
          <div className="mt-5 space-y-3">
            {filteredTickets.length > 0 ? (
              filteredTickets.map((ticket: Ticket) => (
                <div
                  key={ticket.ticket_id}
                  className="rounded-xl border border-gray-200 p-4 transition hover:border-[#6A89A7] hover:shadow-sm"
                >
                  <div className="flex flex-col gap-3">
                    {/* Ticket ID and Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-bold text-[#6A89A7]">
                        HD-{ticket.ticket_id}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          ticket.ticket_status === "Resolved"
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {ticket.ticket_status}
                      </span>
                    </div>

                    {/* Ticket Title */}
                    <h3 className="text-base font-semibold text-body-text">
                      {ticket.title}
                    </h3>

                    {/* Ticket Details */}
                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">
                      <span>Reporter: {ticket.requester_name || "Unknown"}</span>
                      {ticket.department_name && (
                        <span>Department: {ticket.department_name}</span>
                      )}
                      <span>Priority: {ticket.ticket_priority}</span>
                    </div>

                    {/* Resolution Information */}
                    <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 border-t border-gray-100 pt-3 text-xs text-gray-500">
                      <span>
                        Updated: {formatDate(ticket.updated_at || ticket.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              /* Empty State */
              <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center">
                <h3 className="font-semibold text-gray-700">
                  No resolved tickets found
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {resolvedTickets.length === 0
                    ? "You haven't resolved any tickets yet."
                    : "No resolved tickets match your current search or date filter."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Ticket Count */}
        {!loading && resolvedTickets.length > 0 && (
          <p className="mt-5 text-xs text-gray-500">
            Showing {filteredTickets.length} of {resolvedTickets.length} tickets
          </p>
        )}
      </div>
    </div>
  );
};

export default ResolvedTickets;
