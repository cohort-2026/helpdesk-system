
import { useState } from "react";

type ResolvedTicket = {
  id: string;
  title: string;
  reporter: string;
  department: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "Resolved" | "Closed";
  resolvedAt: string;
  resolutionHours: number;
};

const resolvedTickets: ResolvedTicket[] = [
  {
    id: "HD-1052",
    title: "Software installation request",
    reporter: "Nomsa Dlamini",
    department: "Operations",
    priority: "Low",
    status: "Resolved",
    resolvedAt: "2026-11-05T10:30:00",
    resolutionHours: 2,
  },
  {
    id: "HD-1050",
    title: "Network connection issue",
    reporter: "James Nkosi",
    department: "IT",
    priority: "High",
    status: "Resolved",
    resolvedAt: "2026-11-04T14:00:00",
    resolutionHours: 5,
  },
  {
    id: "HD-1040",
    title: "Unable to access company portal",
    reporter: "Sarah Johnson",
    department: "Human Resources",
    priority: "Medium",
    status: "Closed",
    resolvedAt: "2026-10-30T11:00:00",
    resolutionHours: 3,
  },
];

type DateRange = "all" | "today" | "7days" | "30days";

const ResolvedTickets = () => {
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>("all");

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

  // Search and filter the logged-in agent's resolved tickets
  const filteredTickets = resolvedTickets.filter((ticket) => {
    const matchesSearch =
      ticket.id.toLowerCase().includes(search.toLowerCase()) ||
      ticket.title.toLowerCase().includes(search.toLowerCase()) ||
      ticket.reporter.toLowerCase().includes(search.toLowerCase());

    let matchesDate = true;

    if (dateRange === "today") {
      matchesDate = isToday(ticket.resolvedAt);
    } else if (dateRange === "7days") {
      matchesDate = isWithinDays(ticket.resolvedAt, 7);
    } else if (dateRange === "30days") {
      matchesDate = isWithinDays(ticket.resolvedAt, 30);
    }

    return matchesSearch && matchesDate;
  });

  // Format resolution time
  const formatResolutionTime = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} minutes`;
    }

    return `${hours.toFixed(1)} hours`;
  };

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

  return (
    <div className="space-y-6">

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
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

        <div className="mb-5">
          <h2 className="text-lg font-bold text-body-text">
            My Resolved Tickets
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Search and review your completed tickets.
          </p>
        </div>

        {/* Search and Date Filter */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, title or reporter..."
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-[#6A89A7] focus:ring-1 focus:ring-[#6A89A7]"
          />

          {/* Date Filter */}
          <select
            value={dateRange}
            onChange={(e) =>
              setDateRange(e.target.value as DateRange)
            }
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-[#6A89A7]"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>

        </div>

        {/* Resolved Ticket Cards */}
        <div className="mt-5 space-y-3">

          {filteredTickets.length > 0 ? (
            filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="rounded-xl border border-gray-200 p-4 transition hover:border-[#6A89A7] hover:shadow-sm"
              >
                <div className="flex flex-col gap-3">

                  {/* Ticket ID and Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-bold text-[#6A89A7]">
                      {ticket.id}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        ticket.status === "Resolved"
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </div>

                  {/* Ticket Title */}
                  <h3 className="text-base font-semibold text-body-text">
                    {ticket.title}
                  </h3>

                  {/* Ticket Details */}
                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">
                    <span>Reporter: {ticket.reporter}</span>
                    <span>Department: {ticket.department}</span>
                    <span>Priority: {ticket.priority}</span>
                  </div>

                  {/* Resolution Information */}
                  <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 border-t border-gray-100 pt-3 text-xs text-gray-500">
                    <span>
                      Resolved: {formatDate(ticket.resolvedAt)}
                    </span>

                    <span>
                      Time to resolve:{" "}
                      {formatResolutionTime(ticket.resolutionHours)}
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
                You have no resolved tickets matching your current search
                or date filter.
              </p>
            </div>
          )}

        </div>

        {/* Ticket Count */}
        <p className="mt-5 text-xs text-gray-500">
          Showing {filteredTickets.length} of {resolvedTickets.length} tickets
        </p>

      </div>
    </div>
  );
};

export default ResolvedTickets;
