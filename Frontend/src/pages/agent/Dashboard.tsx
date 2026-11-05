import { useState } from "react";
const tickets = [
  {
    id: "HD-1042",
    title: "Password reset",
    priority: "High",
    status: "Open",
    assignment: "Unassigned",
    category: "unassigned",
  },
  {
    id: "HD-1045",
    title: "Printer out of toner",
    priority: "Low",
    status: "Open",
    assignment: "Unassigned",
    category: "unassigned",
  },
  {
    id: "HD-1048",
    title: "Unable to access email",
    priority: "Medium",
    status: "In Progress",
    assignment: "Assigned to me",
    category: "my",
  },
  {
    id: "HD-1050",
    title: "Network connection issue",
    priority: "High",
    status: "In Progress",
    assignment: "Assigned to me",
    category: "my",
  },
  {
    id: "HD-1052",
    title: "Software installation",
    priority: "Low",
    status: "Resolved",
    assignment: "Resolved by me",
    category: "resolved",
  },
];

const AgentDashboard = () => {
  const [activeTab, setActiveTab] = useState("my");

  const filteredTickets = tickets.filter(
    (ticket) => ticket.category === activeTab
  );

  const tabs = [
    { label: "My Tickets", value: "my" },
    { label: "Unassigned", value: "unassigned" },
    { label: "Resolved", value: "resolved" },
  ];

  return (
    <div className="min-h-screen bg-white p-6">

      {/* Dashboard Heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage and monitor your support tickets.
        </p>
      </div>

      {/* Ticket Tabs */}
      <div className="mb-5 flex flex-wrap gap-2 border-b border-gray-200 pb-3">

        {tabs.map((tab) => {
          const count = tickets.filter(
            (ticket) => ticket.category === tab.value
          ).length;

          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`rounded-md px-5 py-2 text-sm font-medium transition ${
                activeTab === tab.value
                  ? "bg-[#6A89A7] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label} ({count})
            </button>
          );
        })}

      </div>

      {/* Ticket Cards */}
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
                  {ticket.id} <span className="mx-1">·</span>
                  {ticket.assignment}
                </p>

                <h3 className="text-sm font-semibold text-gray-800">
                  {ticket.title}
                </h3>

              </div>

              {/* Priority and Status */}
              <div className="flex items-center gap-2">

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
                    ticket.status === "Open"
                      ? "bg-gray-100 text-gray-700"
                      : ticket.status === "In Progress"
                      ? "bg-blue-50 text-[#6A89A7]"
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
            <p className="text-sm text-gray-500">
              No tickets found in this category.
            </p>
          </div>

        )}

      </div>

    </div>
  );
};

export default AgentDashboard;
