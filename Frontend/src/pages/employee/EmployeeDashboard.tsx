import { useState } from "react";
import { useTickets } from "../../hooks/useTickets";
import { useToast } from "../../components/ui/Toast";
import type { Ticket } from "../../types/ticket.types";
import { Button } from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/ui/Loader";

export default function EmployeeDashboard() {
  const { toastElement, showToast } = useToast();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");

  const { tickets, loading, error } = useTickets({
    filters: { limit: 100 },
    autoFetch: true,
  });

  // Client-side filtering of the fetched tickets
  const filtered = tickets.filter((t: Ticket) => {
    const matchesSearch = `${t.ticket_id} ${t.title}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "All Statuses" || t.ticket_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const priorityColor = (p: string) => {
    if (p === "High") return "text-red-600";
    if (p === "Medium") return "text-orange-500";
    return "text-teal-600";
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      Open: "bg-blue-50 text-blue-700",
      "In progress": "bg-indigo-50 text-indigo-700",
      "Pending approval": "bg-amber-50 text-amber-700",
      Resolved: "bg-emerald-50 text-emerald-700",
      Closed: "bg-gray-100 text-gray-600",
      Cancelled: "bg-red-50 text-red-600",
    };
    return map[status] || "bg-gray-100 text-gray-700";
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-ZA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Show errors via toast
  if (error && !loading) {
    showToast(error, "error");
  }

  return (
    <div className="min-h-screen">
      {toastElement}
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-[20px] font-bold">My Requests</h1>
          <Button
            type="button"
            variant="primary"
            onClick={() => navigate("/employee/submit-request")}
          >
            New Request
          </Button>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-3 mb-4">
          <input
            id="search-tickets"
            placeholder="Search by keyword or Ticket ID..."
            className="border border-gray-300 rounded px-3 py-2 text-sm w-[380px] focus:border-[#6A89A7] outline-none transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            id="status-filter"
            className="border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:border-[#6A89A7] outline-none transition-colors"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Statuses</option>
            <option>Open</option>
            <option>In progress</option>
            <option>Pending approval</option>
            <option>Resolved</option>
            <option>Closed</option>
            <option>Cancelled</option>
          </select>
        </div>

        {/* Loading State */}
        {loading && <Loader />}

        {/* Ticket List */}
        {!loading && (
          <div className="border border-gray-200 rounded">
            {filtered.length === 0 && tickets.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm text-gray-600">
                  You haven't submitted any requests yet. Need help?
                </p>
                <a
                  href="/employee/submit-request"
                  className="text-blue-600 text-sm mt-1 underline inline-block"
                >
                  Create a new request
                </a>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center text-sm text-gray-500">
                No requests match your search
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filtered.map((t: Ticket) => (
                  <div
                    key={t.ticket_id}
                    onClick={() => navigate(`/employee/tickets/${t.ticket_id}`)}
                    className="flex justify-between items-center px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="text-[12px] text-gray-500">
                        HD-{t.ticket_id}
                        {t.department_name && ` · ${t.department_name}`}
                      </p>
                      <p className="text-[14px] font-medium mt-1">{t.title}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {formatDate(t.created_at)}
                        {t.assignee_name && ` · Assigned to ${t.assignee_name}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[13px] font-medium ${priorityColor(t.ticket_priority)}`}
                      >
                        {t.ticket_priority}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadge(t.ticket_status)}`}
                      >
                        {t.ticket_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Count */}
        {!loading && tickets.length > 0 && (
          <p className="text-xs text-gray-500 mt-3">
            Showing {filtered.length} of {tickets.length} requests
          </p>
        )}
      </div>
    </div>
  );
}
