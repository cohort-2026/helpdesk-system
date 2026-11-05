
import { useState } from "react";

type AssignedTicket = {
  id: string;
  title: string;
  reporter: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "In Progress" | "On Hold" | "Pending User Response" | "Resolved";
  updatedAt: string;
};

const tickets: AssignedTicket[] = [
  {
    id: "HD-1048",
    title: "Unable to access email",
    reporter: "Thandi Mokoena",
    priority: "Medium",
    status: "In Progress",
    updatedAt: "2026-11-05T10:30:00",
  },
  {
    id: "HD-1050",
    title: "Network connection issue",
    reporter: "James Nkosi",
    priority: "High",
    status: "In Progress",
    updatedAt: "2026-11-04T14:00:00",
  },
  {
    id: "HD-1053",
    title: "Unable to access company software",
    reporter: "Sarah Johnson",
    priority: "Critical",
    status: "On Hold",
    updatedAt: "2026-11-03T09:00:00",
  },
  {
    id: "HD-1055",
    title: "Account verification required",
    reporter: "Nomsa Dlamini",
    priority: "Low",
    status: "Pending User Response",
    updatedAt: "2026-11-05T11:00:00",
  },
];

type SortOption = "newest" | "oldest" | "priority";

const AssignedTickets = () => {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const priorityOrder = {
    Critical: 4,
    High: 3,
    Medium: 2,
    Low: 1,
  };

  const filteredTickets = tickets
    .filter((ticket) => {
      return (
        ticket.id.toLowerCase().includes(search.toLowerCase()) ||
        ticket.title.toLowerCase().includes(search.toLowerCase()) ||
        ticket.reporter.toLowerCase().includes(search.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (sortBy === "priority") {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }

      if (sortBy === "oldest") {
        return (
          new Date(a.updatedAt).getTime() -
          new Date(b.updatedAt).getTime()
        );
      }

      return (
        new Date(b.updatedAt).getTime() -
        new Date(a.updatedAt).getTime()
      );
    });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-ZA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">

      {/* Page Heading */}
      <div>
        <h1 className="text-2xl font-bold text-body-text">
          Assigned Tickets
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          View and manage tickets assigned to you.
        </p>
      </div>

      {/* Search and Sorting */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by ID, title or reporter..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-[#6A89A7] sm:max-w-md"
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-[#6A89A7]"
        >
          <option value="newest">Recently Updated</option>
          <option value="oldest">Oldest Updated</option>
          <option value="priority">Priority: Critical to Low</option>
        </select>

      </div>

      {/* Assigned Ticket Cards */}
      <div className="space-y-3">

        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => (

            <div
              key={ticket.id}
              className="flex flex-col gap-3 rounded-md border border-gray-300 bg-white p-4 transition hover:border-[#6A89A7] hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >

              {/* Ticket Information */}
              <div className="space-y-1">

                <p className="text-xs font-medium text-gray-500">
                  {ticket.id}
                </p>

                <h3 className="text-sm font-semibold text-gray-800">
                  {ticket.title}
                </h3>

                <p className="text-xs text-gray-500">
                  Reporter: {ticket.reporter}
                </p>

                <p className="text-xs text-gray-500">
                  Last updated: {formatDate(ticket.updatedAt)}
                </p>

              </div>

              {/* Priority and Status */}
              <div className="flex flex-wrap items-center gap-2">

                <span
                  className={`rounded-sm px-3 py-1 text-xs font-medium ${
                    ticket.priority === "Critical" ||
                    ticket.priority === "High"
                      ? "bg-red-50 text-red-600"
                      : ticket.priority === "Medium"
                      ? "bg-yellow-50 text-yellow-700"
                      : "bg-green-50 text-green-700"
                  }`}
                >
                  {ticket.priority}
                </span>

                <span
                  className={`rounded-sm px-3 py-1 text-xs font-medium ${
                    ticket.status === "In Progress"
                      ? "bg-blue-50 text-[#6A89A7]"
                      : ticket.status === "On Hold"
                      ? "bg-yellow-50 text-yellow-700"
                      : ticket.status === "Pending User Response"
                      ? "bg-orange-50 text-orange-700"
                      : "bg-green-50 text-green-700"
                  }`}
                >
                  {ticket.status}
                </span>

              </div>

            </div>

          ))
        ) : (

          <div className="rounded-md border border-dashed border-gray-300 p-10 text-center">
            <p className="text-sm font-medium text-gray-700">
              No assigned tickets found.
            </p>

            <p className="mt-2 text-sm text-gray-500">
              You currently have no tickets matching your search.
            </p>
          </div>

        )}

      </div>

      {/* Ticket Count */}
      <p className="text-xs text-gray-500">
        Showing {filteredTickets.length} of {tickets.length} assigned tickets
      </p>

    </div>
  );
};

export default AssignedTickets;
