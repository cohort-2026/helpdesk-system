import { useState } from "react";

type Ticket = {
  id: string;
  title: string;
  department: string;
  type: string;
  priority: "High" | "Medium" | "Low";
  status: string;
  description: string;
};

export default function EmployeeDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");

  const [form, setForm] = useState({
    title: "",
    department: "IT",
    type: "",
    priority: "High" as const,
    description: "",
  });

  const addRequest = () => {
    if (!form.title.trim()) return;
    const newTicket: Ticket = {
      id: `HD ${1042 + tickets.length}`,
      title: form.title,
      department: form.department,
      type: form.type,
      priority: form.priority,
      status: "Open",
      description: form.description,
    };
    setTickets([...tickets, newTicket]);
    setShowModal(false);
    setForm({
      title: "",
      department: "IT",
      type: "",
      priority: "High",
      description: "",
    });
  };

  const filtered = tickets.filter((t) => {
    const matchesSearch = `${t.id} ${t.title}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "All Statuses" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const priorityColor = (p: string) => {
    if (p === "High") return "text-red-600";
    if (p === "Medium") return "text-orange-500";
    return "text-teal-600";
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-[20px] font-bold">My Requests</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded-md"
          >
            + New Request
          </button>
        </div>

        <div className="flex gap-3 mb-4">
          <input
            placeholder="Search by keyword or Ticket ID..."
            className="border border-gray-300 rounded px-3 py-2 text-sm w-[380px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="border border-gray-300 rounded px-3 py-2 text-sm bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Statuses</option>
            <option>Open</option>
            <option>Pending approval</option>
            <option>Waiting on Employee</option>
            <option>Closed</option>
          </select>
        </div>

        <div className="border border-gray-200 rounded">
          {filtered.length === 0 && tickets.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-gray-600">
                You haven't submitted any requests yet. Need help?
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="text-blue-600 text-sm mt-1 underline"
              >
                Create a new request
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-sm text-gray-500">
              No requests match your search
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filtered.map((t) => (
                <div
                  key={t.id}
                  className="flex justify-between items-center px-4 py-3 hover:bg-gray-50"
                >
                  <div>
                    <p className="text-[12px] text-gray-500">
                      {t.id} · {t.department} · {t.type}
                    </p>
                    <p className="text-[14px] font-medium mt-1">{t.title}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <span
                      className={`text-[13px] font-medium ${priorityColor(t.priority)}`}
                    >
                      {t.priority}
                    </span>
                    <span className="text-[13px] text-gray-700 w-[160px] text-right">
                      {t.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="font-bold mb-4">New Request</h2>

            <label className="text-xs text-gray-600">Title *</label>
            <input
              className="border w-full rounded px-3 py-2 mb-3 text-sm"
              placeholder="e.g. Password reset"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs text-gray-600">Department</label>
                <select
                  className="border w-full rounded px-3 py-2 text-sm"
                  value={form.department}
                  onChange={(e) =>
                    setForm({ ...form, department: e.target.value })
                  }
                >
                  <option>IT</option>
                  <option>Finance</option>
                  <option>HR</option>
                  <option>Support</option>
                  <option>Facilities</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600">Request Type</label>
                <input
                  className="border w-full rounded px-3 py-2 text-sm"
                  placeholder="e.g. Fix it, New Laptop"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="text-xs text-gray-600">
                Priority (High/Medium/Low)
              </label>
              <select
                className="border w-full rounded px-3 py-2 text-sm"
                value={form.priority}
                onChange={(e) =>
                  setForm({ ...form, priority: e.target.value as any })
                }
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>

            <label className="text-xs text-gray-600">Description</label>
            <textarea
              className="border w-full rounded px-3 py-2 mb-4 text-sm"
              rows={3}
              placeholder="Describe your issue"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={addRequest}
                className="bg-blue-600 text-white px-5 py-2 text-sm rounded"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
