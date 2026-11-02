import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const API = "http://localhost:5000/api";

interface Ticket {
  _id: string;
  ticketId?: string;
  title: string;
  category?: string;
  department?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
}
const statusColors: Record<string, string> = {
  Open: "bg-blue-100 text-blue-800",
  "In Progress": "bg-yellow-100 text-yellow-800",
  "Pending User Input":
    "bg-orange-100 text-orange-800 border border-orange-300",
  Resolved: "bg-green-100 text-green-800",
  Closed: "bg-gray-200 text-gray-700",
};

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    const fetchMyTickets = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}/tickets/my-requests`, {
          withCredentials: true,
        });
        setTickets(res.data.tickets || res.data || []);
      } catch {
        try {
          const res2 = await axios.get(`${API}/tickets`, {
            withCredentials: true,
          });
          setTickets(res2.data.tickets || res2.data || []);
        } catch {}
      } finally {
        setLoading(false);
      }
    };
    fetchMyTickets();
  }, []);

  const filtered = tickets.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.ticketId || t._id).toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "All"
        ? true
        : statusFilter === "Active/Open"
          ? ["Open", "In Progress", "Pending User Input"].includes(t.status)
          : t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading)
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Requests</h1>
        <button
          onClick={() => navigate("/employee/submit-request")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + New Request
        </button>
      </div>
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by keyword or Ticket ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-4 py-2 flex-1 max-w-md"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-4 py-2"
        >
          <option value="All">All Statuses</option>
          <option value="Active/Open">Active / Open</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Pending User Input">Pending User Input</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-16 border rounded-lg bg-gray-50">
          <p className="text-gray-600 mb-2">
            You haven't submitted any requests yet. Need help?
          </p>
          <button
            onClick={() => navigate("/employee/submit-request")}
            className="text-blue-600 underline"
          >
            Create a new request
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Ticket ID</th>
                <th className="p-3">Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date Submitted</th>
                <th className="p-3">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ticket) => (
                <tr
                  key={ticket._id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`border-t hover:bg-gray-50 cursor-pointer ${ticket.status === "Pending User Input" ? "bg-orange-50 border-l-4 border-l-orange-400" : ""}`}
                >
                  <td className="p-3 text-sm font-mono">
                    {ticket.ticketId || ticket._id.slice(-6).toUpperCase()}
                  </td>
                  <td className="p-3 font-medium">{ticket.title}</td>
                  <td className="p-3">
                    {ticket.category || ticket.department || "-"}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[ticket.status] || "bg-gray-100"}`}
                    >
                      {ticket.status}
                    </span>
                  </td>
                  <td className="p-3 text-sm">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-sm">
                    {new Date(ticket.updatedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {selectedTicket && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTicket(null)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">{selectedTicket.title}</h2>
              <button onClick={() => setSelectedTicket(null)}>✕</button>
            </div>
            <p className="mb-2">
              <strong>ID:</strong>{" "}
              {selectedTicket.ticketId || selectedTicket._id}
            </p>
            <p className="mb-2">
              <strong>Status:</strong> {selectedTicket.status}
            </p>
            <p className="mb-4">
              <strong>Description:</strong>{" "}
              {selectedTicket.description || "No description"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
export default EmployeeDashboard;
