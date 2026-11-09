import { useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTickets } from "../../hooks/useTickets";
import { useToast } from "../../hooks/useToast";
import type { Ticket } from "../../types/ticket.types";
import Loader from "../../components/ui/Loader";

const AgentDashboard = () => {
  const { user } = useAuth();
  const { toastElement, showToast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("my");
  const [claimingId, setClaimingId] = useState<number | null>(null);

  const userId = user?.id || user?.user_id || "";
  const departmentId = user?.department_id ?? undefined;

  // Fetch agent's assigned tickets
  const {
    tickets: myTickets,
    loading: myLoading,
    error: myError,
    refetch: refetchMy,
  } = useTickets({
    filters: {
      assignee_id: userId ? String(userId) : undefined,
      limit: 100,
    },
    autoFetch: !!userId,
  });

  // Fetch department's unassigned tickets
  const {
    tickets: deptTickets,
    loading: deptLoading,
    error: deptError,
    claimTicket,
    refetch: refetchDept,
  } = useTickets({
    filters: {
      status: "Open",
      department_id: departmentId ? Number(departmentId) : undefined,
      limit: 100,
    },
    autoFetch: true,
  });

  const activeAssigned = myTickets.filter(
    (t) =>
      t.ticket_status !== "Resolved" &&
      t.ticket_status !== "Closed" &&
      t.ticket_status !== "Cancelled",
  );

  const resolvedByMe = myTickets.filter(
    (t) => t.ticket_status === "Resolved" || t.ticket_status === "Closed",
  );

  const unassigned = deptTickets.filter(
    (t) => !t.assignee_id || t.assignee_id === null,
  );

  const handleClaim = useCallback(
    async (ticketId: number) => {
      setClaimingId(ticketId);
      try {
        await claimTicket(ticketId);
        showToast("Ticket claimed successfully!", "success");
        // Refresh both lists
        refetchMy();
      } catch (err: unknown) {
        const error = err as Error & { statusCode?: number };
        if (error.statusCode === 409) {
          showToast(
            "This ticket was already claimed by another agent.",
            "warning",
          );
          refetchDept();
        } else {
          showToast(error.message || "Failed to claim ticket.", "error");
        }
      } finally {
        setClaimingId(null);
      }
    },
    [claimTicket, showToast, refetchMy, refetchDept],
  );

  const tabs = [
    { label: "My Tickets", value: "my", count: activeAssigned.length },
    { label: "Unassigned", value: "unassigned", count: unassigned.length },
    { label: "Resolved", value: "resolved", count: resolvedByMe.length },
  ];

  const getDisplayTickets = (): Ticket[] => {
    if (activeTab === "my") return activeAssigned;
    if (activeTab === "unassigned") return unassigned;
    return resolvedByMe;
  };

  const isLoading = activeTab === "unassigned" ? deptLoading : myLoading;
  const displayTickets = getDisplayTickets();

  // Show error toasts
  if (myError && !myLoading) showToast(myError, "error");
  if (deptError && !deptLoading) showToast(deptError, "error");

  return (
    <div className="min-h-screen p-6">
      {toastElement}

      {/* Dashboard Heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage and monitor your support tickets.
        </p>
      </div>

      {/* Ticket Tabs */}
      <div className="mb-5 flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            id={`tab-${tab.value}`}
            onClick={() => setActiveTab(tab.value)}
            className={`rounded-md px-5 py-2 text-sm font-medium transition ${
              activeTab === tab.value
                ? "bg-[#6A89A7] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && <Loader />}

      {/* Ticket Cards */}
      {!isLoading && (
        <div className="space-y-3">
          {displayTickets.length > 0 ? (
            displayTickets.map((ticket: Ticket) => (
              <div
                key={ticket.ticket_id}
                onClick={() => navigate(`/agent/tickets/${ticket.ticket_id}`)}
                style={{ cursor: "pointer" }}
                className="flex flex-col gap-3 rounded-md border border-gray-300 bg-white p-4 transition hover:border-[#6A89A7] hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                {/* Ticket Information */}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500">
                    HD-{ticket.ticket_id}
                    <span className="mx-1">·</span>
                    {ticket.assignee_id
                      ? ticket.assignee_name
                        ? `Assigned to ${ticket.assignee_name}`
                        : "Assigned"
                      : "Unassigned"}
                  </p>

                  <h3 className="text-sm font-semibold text-gray-800">
                    {ticket.title}
                  </h3>

                  {ticket.requester_name && (
                    <p className="text-xs text-gray-500">
                      Requester: {ticket.requester_name}
                    </p>
                  )}
                </div>

                {/* Priority, Status, and optional Claim button */}
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-sm px-3 py-1 text-xs font-medium ${
                      ticket.ticket_priority === "High"
                        ? "bg-red-50 text-red-600"
                        : ticket.ticket_priority === "Medium"
                          ? "bg-yellow-50 text-yellow-700"
                          : "bg-green-50 text-green-700"
                    }`}
                  >
                    {ticket.ticket_priority}
                  </span>

                  <span
                    className={`rounded-sm px-3 py-1 text-xs font-medium ${
                      ticket.ticket_status === "Open"
                        ? "bg-gray-100 text-gray-700"
                        : ticket.ticket_status === "In progress"
                          ? "bg-blue-50 text-[#6A89A7]"
                          : ticket.ticket_status === "Resolved" ||
                              ticket.ticket_status === "Closed"
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {ticket.ticket_status}
                  </span>

                  {/* Show Claim button for unassigned tab tickets */}
                  {activeTab === "unassigned" && !ticket.assignee_id && (
                    <button
                      id={`dashboard-claim-${ticket.ticket_id}`}
                      onClick={() => handleClaim(ticket.ticket_id)}
                      disabled={claimingId === ticket.ticket_id}
                      className="ml-2 inline-flex items-center gap-1.5 rounded-md bg-[#6A89A7] px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-[#5a7a98] disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {claimingId === ticket.ticket_id ? (
                        <>
                          <span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></span>
                          Claiming…
                        </>
                      ) : (
                        "Claim"
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-md border border-dashed border-gray-300 p-10 text-center">
              <p className="text-sm text-gray-500">
                No tickets found in this category.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;
