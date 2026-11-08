
import { useState } from "react";

type TicketStatus = "Open" | "In Progress" | "Pending Approval" | "Resolved" |"Closed" | "Cancelled";

const statusTabs: { label: TicketStatus; count: number }[] = [
  { label: "Open", count: 6 },
  { label: "In Progress", count: 9 },
  { label: "Pending Approval", count: 3 },
  { label: "Resolved", count: 24 },
  { label: "Closed", count: 12 },
  { label: "Cancelled", count: 5 },
];

// Temporary sample data until we connect the backend
const tickets = [
  {
    id: "HD-1018",
    title: "Password reset",
    priority: "High",
    status: "Open" as TicketStatus,
    agent: "Assigned Agent",
  },
  {
    id: "HD-1020",
    title: "Network connectivity issue",
    priority: "Medium",
    status: "In Progress" as TicketStatus,
    agent: "Assigned Agent",
  },
  {
    id: "HD-1022",
    title: "Email access request",
    priority: "Low",
    status: "Waiting" as TicketStatus,
    agent: "Assigned Agent",
  },
  {
    id: "HD-1025",
    title: "Software installation",
    priority: "Medium",
    status: "Resolved" as TicketStatus,
    agent: "Assigned Agent",
  },
];

const Dashboard = () => {
  const [selectedStatus, setSelectedStatus] =
    useState<TicketStatus>("Open");

  const filteredTickets = tickets.filter(
    (ticket) => ticket.status === selectedStatus
  );

  return (
    <div className="space-y-8">

      {/* Dashboard Heading */}
      <div className='mb-6'>
        
        <h1 className="text-2xl font-bold text-gray-800">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Monitor your department's activity and team performance.
        </p>
      </div>

      {/* Ticket Status Tabs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">

        {statusTabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setSelectedStatus(tab.label)}
            className={`rounded-sm px-5 py-1 text-xs font-medium
              ${
                selectedStatus === tab.label
                  ? "bg-[#6D91B2] text-white"
                  : "bg-[#F1F2F5] text-body-text hover:bg-[#E5E7EB]"
              }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}

      </div>

    
      {/* Agent Workload */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-body-text">
          Agent Workload
        </h2>

        <div className="rounded-lg border border-secondary/20 bg-background p-4">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <p className="font-semibold text-body-text">
                Assigned Department Agent
              </p>

            </div>

            <div className="flex gap-4 text-sm text-secondary">
              <span>4 Open</span>
              <span>12 Resolved</span>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Ticket Activity */}
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-body-text">
            Recent Ticket Activity
          </h2>

          <span className="text-sm text-secondary">
            {selectedStatus} Tickets
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-secondary/20">

          <table className="w-full text-left text-sm">
            <thead className="bg-accent/5 text-secondary">
              <tr>
                <th className="px-4 py-3 font-semibold">Ticket ID</th>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Priority</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Assigned Agent</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-secondary/20">

              {filteredTickets.length > 0 ? (
                filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-accent/5"
                  >
                    <td className="whitespace-nowrap px-4 py-4 font-medium">
                      {ticket.id}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      {ticket.title}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      {ticket.priority}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      {ticket.status}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      {ticket.agent}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-secondary"
                  >
                    No tickets found.
                  </td>
                </tr>
              )}

            </tbody>
          </table>

        </div>
      </section>

    </div>
  );
};

export default Dashboard;
